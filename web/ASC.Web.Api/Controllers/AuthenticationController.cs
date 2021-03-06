﻿using System;
using System.Globalization;
using System.Linq;
using System.Security.Authentication;
using System.Threading;

using ASC.Api.Utils;
using ASC.Common;
using ASC.Common.Caching;
using ASC.Common.Utils;
using ASC.Core;
using ASC.Core.Common.Security;
using ASC.Core.Tenants;
using ASC.Core.Users;
using ASC.FederatedLogin;
using ASC.FederatedLogin.LoginProviders;
using ASC.FederatedLogin.Profile;
using ASC.MessagingSystem;
using ASC.Security.Cryptography;
using ASC.Web.Api.Core;
using ASC.Web.Api.Models;
using ASC.Web.Api.Routing;
using ASC.Web.Core;
using ASC.Web.Core.PublicResources;
using ASC.Web.Core.Users;
using ASC.Web.Studio.Core;
using ASC.Web.Studio.Core.Notify;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

using static ASC.Security.Cryptography.EmailValidationKeyProvider;

namespace ASC.Web.Api.Controllers
{
    [Scope]
    [DefaultRoute]
    [ApiController]
    [AllowAnonymous]
    public class AuthenticationController : ControllerBase
    {
        private UserManager UserManager { get; }
        private TenantManager TenantManager { get; }
        private SecurityContext SecurityContext { get; }
        private TenantCookieSettingsHelper TenantCookieSettingsHelper { get; }
        private CookiesManager CookiesManager { get; }
        private PasswordHasher PasswordHasher { get; }
        private EmailValidationKeyModelHelper EmailValidationKeyModelHelper { get; }
        private ICache Cache { get; }
        private SetupInfo SetupInfo { get; }
        private MessageService MessageService { get; }
        private ProviderManager ProviderManager { get; }
        private IOptionsSnapshot<AccountLinker> AccountLinker { get; }
        private CoreBaseSettings CoreBaseSettings { get; }
        private PersonalSettingsHelper PersonalSettingsHelper { get; }
        private StudioNotifyService StudioNotifyService { get; }
        private UserHelpTourHelper UserHelpTourHelper { get; }
        public Signature Signature { get; }
        public InstanceCrypto InstanceCrypto { get; }
        private UserManagerWrapper UserManagerWrapper { get; }

        public AuthenticationController(
            UserManager userManager,
            TenantManager tenantManager,
            SecurityContext securityContext,
            TenantCookieSettingsHelper tenantCookieSettingsHelper,
            CookiesManager cookiesManager,
            PasswordHasher passwordHasher,
            EmailValidationKeyModelHelper emailValidationKeyModelHelper,
            ICache cache,
            SetupInfo setupInfo,
            MessageService messageService,
            ProviderManager providerManager,
            IOptionsSnapshot<AccountLinker> accountLinker,
            CoreBaseSettings coreBaseSettings,
            PersonalSettingsHelper personalSettingsHelper,
            StudioNotifyService studioNotifyService,
            UserManagerWrapper userManagerWrapper,
            UserHelpTourHelper userHelpTourHelper,
            Signature signature,
            InstanceCrypto instanceCrypto)
        {
            UserManager = userManager;
            TenantManager = tenantManager;
            SecurityContext = securityContext;
            TenantCookieSettingsHelper = tenantCookieSettingsHelper;
            CookiesManager = cookiesManager;
            PasswordHasher = passwordHasher;
            EmailValidationKeyModelHelper = emailValidationKeyModelHelper;
            Cache = cache;
            SetupInfo = setupInfo;
            MessageService = messageService;
            ProviderManager = providerManager;
            AccountLinker = accountLinker;
            CoreBaseSettings = coreBaseSettings;
            PersonalSettingsHelper = personalSettingsHelper;
            StudioNotifyService = studioNotifyService;
            UserHelpTourHelper = userHelpTourHelper;
            Signature = signature;
            InstanceCrypto = instanceCrypto;
            UserManagerWrapper = userManagerWrapper;
        }


        [Read]
        public bool GetIsAuthentificated()
        {
            return SecurityContext.IsAuthenticated;
        }

        [Create(false)]
        public AuthenticationTokenData AuthenticateMeFromBody([FromBody] AuthModel auth)
        {
            return AuthenticateMe(auth);
        }

        [Create(false)]
        [Consumes("application/x-www-form-urlencoded")]
        public AuthenticationTokenData AuthenticateMeFromForm([FromForm] AuthModel auth)
        {
            return AuthenticateMe(auth);
        }

        [Create("logout")]
        public void Logout()
        {
            CookiesManager.ClearCookies(CookiesType.AuthKey);
            CookiesManager.ClearCookies(CookiesType.SocketIO);
        }

        [Create("confirm", false)]
        public ValidationResult CheckConfirmFromBody([FromBody] EmailValidationKeyModel model)
        {
            return EmailValidationKeyModelHelper.Validate(model);
        }

        [Create("confirm", false)]
        [Consumes("application/x-www-form-urlencoded")]
        public ValidationResult CheckConfirmFromForm([FromForm] EmailValidationKeyModel model)
        {
            return EmailValidationKeyModelHelper.Validate(model);
        }

        private AuthenticationTokenData AuthenticateMe(AuthModel auth)
        {
            var tenant = TenantManager.GetCurrentTenant();
            var user = GetUser(tenant.TenantId, auth);

            try
            {
                var token = SecurityContext.AuthenticateMe(user.ID);
                CookiesManager.SetCookies(CookiesType.AuthKey, token);
                var expires = TenantCookieSettingsHelper.GetExpiresTime(tenant.TenantId);

                return new AuthenticationTokenData
                {
                    Token = token,
                    Expires = expires
                };
            }
            catch
            {
                throw new Exception("User authentication failed");
            }
        }

        private UserInfo GetUser(int tenantId, AuthModel memberModel)
        {
            var action = MessageAction.LoginFailViaApi;
            UserInfo user = null;
            try
            {
                if ((string.IsNullOrEmpty(memberModel.Provider) && string.IsNullOrEmpty(memberModel.SerializedProfile)) || memberModel.Provider == "email")
                {
                    memberModel.UserName.ThrowIfNull(new ArgumentException(@"userName empty", "userName"));
                    memberModel.PasswordHash.ThrowIfNull(new ArgumentException(@"password empty", "password"));

                    int counter;
                    int.TryParse(Cache.Get<string>("loginsec/" + memberModel.UserName), out counter);
                    if (++counter > SetupInfo.LoginThreshold && !SetupInfo.IsSecretEmail(memberModel.UserName))
                    {
                        throw new BruteForceCredentialException();
                    }
                    Cache.Insert("loginsec/" + memberModel.UserName, counter.ToString(CultureInfo.InvariantCulture), DateTime.UtcNow.Add(TimeSpan.FromMinutes(1)));


                    memberModel.PasswordHash = (memberModel.PasswordHash ?? "").Trim();

                    if (string.IsNullOrEmpty(memberModel.PasswordHash))
                    {
                        memberModel.Password = (memberModel.Password ?? "").Trim();

                        if (!string.IsNullOrEmpty(memberModel.Password))
                        {
                            memberModel.PasswordHash = PasswordHasher.GetClientPassword(memberModel.Password);
                        }
                    }

                    user = UserManager.GetUsersByPasswordHash(
                        tenantId,
                        memberModel.UserName,
                        memberModel.PasswordHash);

                    if (user == null || !UserManager.UserExists(user))
                    {
                        throw new Exception("user not found");
                    }
                }
                else
                {
                    action = MessageAction.LoginFailViaApiSocialAccount;
                    LoginProfile thirdPartyProfile;
                    if (!string.IsNullOrEmpty(memberModel.SerializedProfile))
                    {
                        thirdPartyProfile = new LoginProfile(Signature, InstanceCrypto, memberModel.SerializedProfile);
                    }
                    else
                    {
                        thirdPartyProfile = ProviderManager.GetLoginProfile(memberModel.Provider, memberModel.AccessToken);
                    }
                    
                    memberModel.UserName = thirdPartyProfile.EMail;

                    user = GetUserByThirdParty(thirdPartyProfile);
                }
            }
            catch (BruteForceCredentialException)
            {
                MessageService.Send(!string.IsNullOrEmpty(memberModel.UserName) ? memberModel.UserName : AuditResource.EmailNotSpecified, MessageAction.LoginFailBruteForce);
                throw new AuthenticationException("Login Fail. Too many attempts");
            }
            catch
            {
                MessageService.Send(!string.IsNullOrEmpty(memberModel.UserName) ? memberModel.UserName : AuditResource.EmailNotSpecified, action);
                throw new AuthenticationException("User authentication failed");
            }

            return user;
        }

        private UserInfo GetUserByThirdParty(LoginProfile loginProfile)
        {
            try
            {
                if (!string.IsNullOrEmpty(loginProfile.AuthorizationError))
                {
                    // ignore cancellation
                    if (loginProfile.AuthorizationError != "Canceled at provider")
                    {
                        throw new Exception(loginProfile.AuthorizationError);
                    }
                    return Constants.LostUser;
                }

                var userInfo = Constants.LostUser;

                Guid userId;
                if (TryGetUserByHash(loginProfile.HashId, out userId))
                {
                    userInfo = UserManager.GetUsers(userId);
                }

                var isNew = false;
                if (CoreBaseSettings.Personal)
                {
                    if (UserManager.UserExists(userInfo.ID) && SetupInfo.IsSecretEmail(userInfo.Email))
                    {
                        try
                        {
                            SecurityContext.AuthenticateMe(ASC.Core.Configuration.Constants.CoreSystem);
                            UserManager.DeleteUser(userInfo.ID);
                            userInfo = Constants.LostUser;
                        }
                        finally
                        {
                            SecurityContext.Logout();
                        }
                    }

                    if (!UserManager.UserExists(userInfo.ID))
                    {
                        userInfo = JoinByThirdPartyAccount(loginProfile);

                        isNew = true;
                    }
                }

                if (isNew)
                {
                    //TODO:
                    //var spam = HttpContext.Current.Request["spam"];
                    //if (spam != "on")
                    //{
                    //    try
                    //    {
                    //        const string _databaseID = "com";
                    //        using (var db = DbManager.FromHttpContext(_databaseID))
                    //        {
                    //            db.ExecuteNonQuery(new SqlInsert("template_unsubscribe", false)
                    //                                   .InColumnValue("email", userInfo.Email.ToLowerInvariant())
                    //                                   .InColumnValue("reason", "personal")
                    //                );
                    //            Log.Debug(string.Format("Write to template_unsubscribe {0}", userInfo.Email.ToLowerInvariant()));
                    //        }
                    //    }
                    //    catch (Exception ex)
                    //    {
                    //        Log.Debug(string.Format("ERROR write to template_unsubscribe {0}, email:{1}", ex.Message, userInfo.Email.ToLowerInvariant()));
                    //    }
                    //}

                    StudioNotifyService.UserHasJoin();
                    UserHelpTourHelper.IsNewUser = true;
                    PersonalSettingsHelper.IsNewUser = true;
                }

                return userInfo;
            }
            catch (Exception)
            {
                CookiesManager.ClearCookies(CookiesType.AuthKey);
                CookiesManager.ClearCookies(CookiesType.SocketIO);
                SecurityContext.Logout();
                throw;
            }
        }

        private UserInfo JoinByThirdPartyAccount(LoginProfile loginProfile)
        {
            if (string.IsNullOrEmpty(loginProfile.EMail))
            {
                throw new Exception(Resource.ErrorNotCorrectEmail);
            }

            var userInfo = UserManager.GetUserByEmail(loginProfile.EMail);
            if (!UserManager.UserExists(userInfo.ID))
            {
                var newUserInfo = ProfileToUserInfo(loginProfile);

                try
                {
                    SecurityContext.AuthenticateMe(ASC.Core.Configuration.Constants.CoreSystem);
                    userInfo = UserManagerWrapper.AddUser(newUserInfo, UserManagerWrapper.GeneratePassword());
                }
                finally
                {
                    SecurityContext.Logout();
                }
            }

            var linker = AccountLinker.Get("webstudio");
            linker.AddLink(userInfo.ID.ToString(), loginProfile);

            return userInfo;
        }

        private UserInfo ProfileToUserInfo(LoginProfile loginProfile)
        {
            if (string.IsNullOrEmpty(loginProfile.EMail)) throw new Exception(Resource.ErrorNotCorrectEmail);

            var firstName = loginProfile.FirstName;
            if (string.IsNullOrEmpty(firstName)) firstName = loginProfile.DisplayName;

            var userInfo = new UserInfo
            {
                FirstName = string.IsNullOrEmpty(firstName) ? UserControlsCommonResource.UnknownFirstName : firstName,
                LastName = string.IsNullOrEmpty(loginProfile.LastName) ? UserControlsCommonResource.UnknownLastName : loginProfile.LastName,
                Email = loginProfile.EMail,
                Title = string.Empty,
                Location = string.Empty,
                CultureName = CoreBaseSettings.CustomMode ? "ru-RU" : Thread.CurrentThread.CurrentUICulture.Name,
                ActivationStatus = EmployeeActivationStatus.Activated,
            };

            var gender = loginProfile.Gender;
            if (!string.IsNullOrEmpty(gender))
            {
                userInfo.Sex = gender == "male";
            }

            return userInfo;
        }

        private bool TryGetUserByHash(string hashId, out Guid userId)
        {
            userId = Guid.Empty;
            if (string.IsNullOrEmpty(hashId)) return false;

            var linkedProfiles = AccountLinker.Get("webstudio").GetLinkedObjectsByHashId(hashId);
            var tmp = Guid.Empty;
            if (linkedProfiles.Any(profileId => Guid.TryParse(profileId, out tmp) && UserManager.UserExists(tmp)))
                userId = tmp;
            return true;
        }
    }

    public class AuthenticationTokenData
    {
        public string Token { get; set; }

        public DateTime Expires { get; set; }

        public bool Sms { get; set; }

        public string PhoneNoise { get; set; }

        public bool Tfa { get; set; }

        public string TfaKey { get; set; }

        public static AuthenticationTokenData GetSample()
        {
            return new AuthenticationTokenData
            {
                Expires = DateTime.UtcNow,
                Token = "abcde12345",
                Sms = false,
                PhoneNoise = null,
                Tfa = false,
                TfaKey = null
            };
        }
    }
}