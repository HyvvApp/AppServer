// ------------------------------------------------------------------------------
//  Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.  See License in the project root for license information.
// ------------------------------------------------------------------------------

using System.Collections.Generic;
using System.Runtime.Serialization;

using Microsoft.Graph;

using Newtonsoft.Json;

// **NOTE** This file was generated by a tool and any changes will be overwritten.


namespace Microsoft.OneDrive.Sdk
{
    /// <summary>
    /// The type OpenWithApp.
    /// </summary>
    [DataContract]
    [JsonConverter(typeof(DerivedTypeConverter))]
    public partial class OpenWithApp
    {
    
        /// <summary>
        /// Gets or sets app.
        /// </summary>
        [DataMember(Name = "app", EmitDefaultValue = false, IsRequired = false)]
        public Identity App { get; set; }
    
        /// <summary>
        /// Gets or sets viewUrl.
        /// </summary>
        [DataMember(Name = "viewUrl", EmitDefaultValue = false, IsRequired = false)]
        public string ViewUrl { get; set; }
    
        /// <summary>
        /// Gets or sets editUrl.
        /// </summary>
        [DataMember(Name = "editUrl", EmitDefaultValue = false, IsRequired = false)]
        public string EditUrl { get; set; }
    
        /// <summary>
        /// Gets or sets viewPostParameters.
        /// </summary>
        [DataMember(Name = "viewPostParameters", EmitDefaultValue = false, IsRequired = false)]
        public string ViewPostParameters { get; set; }
    
        /// <summary>
        /// Gets or sets editPostParameters.
        /// </summary>
        [DataMember(Name = "editPostParameters", EmitDefaultValue = false, IsRequired = false)]
        public string EditPostParameters { get; set; }
    
        /// <summary>
        /// Gets or sets additional data.
        /// </summary>
        [JsonExtensionData(ReadData = true)]
        public IDictionary<string, object> AdditionalData { get; set; }
    
    }
}