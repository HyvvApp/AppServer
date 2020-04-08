﻿using System.Collections.Generic;

namespace ASC.Mail.Models
{
    public class ContactModel
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public List<string> Emails { get; set; }
        public List<string> PhoneNumbers { get; set; }
    }
}
