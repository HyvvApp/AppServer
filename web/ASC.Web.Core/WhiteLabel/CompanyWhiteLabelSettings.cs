/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
 *
 * This program is freeware. You can redistribute it and/or modify it under the terms of the GNU 
 * General Public License (GPL) version 3 as published by the Free Software Foundation (https://www.gnu.org/copyleft/gpl.html). 
 * In accordance with Section 7(a) of the GNU GPL its Section 15 shall be amended to the effect that 
 * Ascensio System SIA expressly excludes the warranty of non-infringement of any third-party rights.
 *
 * THIS PROGRAM IS DISTRIBUTED WITHOUT ANY WARRANTY; WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR
 * FITNESS FOR A PARTICULAR PURPOSE. For more details, see GNU GPL at https://www.gnu.org/copyleft/gpl.html
 *
 * You can contact Ascensio System SIA by email at sales@onlyoffice.com
 *
 * The interactive user interfaces in modified source and object code versions of ONLYOFFICE must display 
 * Appropriate Legal Notices, as required under Section 5 of the GNU GPL version 3.
 *
 * Pursuant to Section 7 § 3(b) of the GNU GPL you must retain the original ONLYOFFICE logo which contains 
 * relevant author attributions when distributing the software. If the display of the logo in its graphic 
 * form is not reasonably feasible for technical reasons, you must include the words "Powered by ONLYOFFICE" 
 * in every copy of the program you distribute. 
 * Pursuant to Section 7 § 3(e) we decline to grant you any rights under trademark law for use of our trademarks.
 *
*/


using System;
using System.Text.Json.Serialization;

using ASC.Core;
using ASC.Core.Common.Settings;

using Microsoft.Extensions.DependencyInjection;


namespace ASC.Web.Core.WhiteLabel
{
    public class CompanyWhiteLabelSettingsWrapper
    {
        public CompanyWhiteLabelSettings Settings { get; set; }
    }

    [Serializable]
    public class CompanyWhiteLabelSettings : ISettings
    {
        public string CompanyName { get; set; }

        public string Site { get; set; }

        public string Email { get; set; }

        public string Address { get; set; }

        public string Phone { get; set; }

        [JsonPropertyName("IsLicensor")]
        public bool IsLicensorSetting { get; set; }

        public bool GetIsLicensor(TenantManager tenantManager, CoreSettings coreSettings)
        {
            return IsLicensorSetting
                && (IsDefault(coreSettings) || tenantManager.GetTenantQuota(tenantManager.GetCurrentTenant().TenantId).Branding);
        }


        public bool IsDefault(CoreSettings coreSettings)
        {
            if (!(GetDefault(coreSettings) is CompanyWhiteLabelSettings defaultSettings)) return false;

            return CompanyName == defaultSettings.CompanyName &&
                    Site == defaultSettings.Site &&
                    Email == defaultSettings.Email &&
                    Address == defaultSettings.Address &&
                    Phone == defaultSettings.Phone &&
                    IsLicensorSetting == defaultSettings.IsLicensorSetting;
        }

        #region ISettings Members

        public Guid ID
        {
            get { return new Guid("{C3C5A846-01A3-476D-A962-1CFD78C04ADB}"); }
        }

        private static CompanyWhiteLabelSettings _default;

        public ISettings GetDefault(IServiceProvider serviceProvider)
        {
            if (_default != null) return _default;

            return GetDefault(serviceProvider.GetService<CoreSettings>());
        }

        public ISettings GetDefault(CoreSettings coreSettings)
        {
            if (_default != null) return _default;

            var settings = coreSettings.GetSetting("CompanyWhiteLabelSettings");

            _default = string.IsNullOrEmpty(settings) ? new CompanyWhiteLabelSettings() : Newtonsoft.Json.JsonConvert.DeserializeObject<CompanyWhiteLabelSettings>(settings);

            return _default;
        }

        #endregion

        public static CompanyWhiteLabelSettings Instance(SettingsManager settingsManager)
        {
            return settingsManager.LoadForDefaultTenant<CompanyWhiteLabelSettings>();
        }
    }
}
