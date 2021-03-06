﻿using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Xml.Linq;

using ASC.Common;
using ASC.Common.Utils;

using CommandLine;

using Microsoft.Extensions.DependencyInjection;

namespace ASC.Resource.Manager
{
    class Program
    {
        private const string CsProjScheme = "http://schemas.microsoft.com/developer/msbuild/2003";
        private static readonly XName ItemGroupXname = XName.Get("ItemGroup", CsProjScheme);
        private static readonly XName EmbededXname = XName.Get("EmbeddedResource", CsProjScheme);
        private static readonly XName DependentUpon = XName.Get("DependentUpon", CsProjScheme);
        private const string IncludeAttribute = "Include";

        public static void Main(string[] args)
        {
            Parser.Default.ParseArguments<Options>(args).WithParsed(Export);
        }

        public static void Export(Options options)
        {
            var services = new ServiceCollection();
            var startup = new Startup();
            startup.ConfigureServices(services);

            var serviceProvider = services.BuildServiceProvider();
            using var scope = serviceProvider.CreateScope();
            var scopeClass = scope.ServiceProvider.GetService<ProgramScope>();

            var cultures = new List<string>();
            var projects = new List<ResFile>();
            var enabledSettings = new EnabledSettings();
            Func<IServiceProvider, string, string, string, string, string, string, bool> export = null;

            try
            {
                var (project, module, filePath, exportPath, culture, format, key) = options;

                project = "WebStudio";
                module = "WebStudio";
                filePath = "AuditResource.resx";
                exportPath = @"C:\Git\portals_core\web\ASC.Web.Api\Core\";
                key = "EmailNotSpecified";

                if (format == "json")
                {
                    export = JsonManager.Export;
                }
                else
                {
                    export = ResxManager.Export;
                }

                if (string.IsNullOrEmpty(exportPath))
                {
                    exportPath = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
                }

                if (!Path.IsPathRooted(exportPath))
                {
                    exportPath = Path.GetFullPath(Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location), exportPath));
                }

                if (!Directory.Exists(exportPath))
                {
                    Console.WriteLine("Error!!! Export path doesn't exist! Please enter a valid directory path.");
                    return;
                }

                enabledSettings = scopeClass.Configuration.GetSetting<EnabledSettings>("enabled");
                cultures = scopeClass.ResourceData.GetCultures().Where(r => r.Available).Select(r => r.Title).Intersect(enabledSettings.Langs).ToList();
                projects = scopeClass.ResourceData.GetAllFiles();

                ExportWithProject(project, module, filePath, culture, exportPath, key);

                Console.WriteLine("The data has been successfully exported!");
            }
            catch (Exception err)
            {
                Console.WriteLine(err);
            }

            void ExportWithProject(string projectName, string moduleName, string fileName, string culture, string exportPath, string key = null)
            {
                if (!string.IsNullOrEmpty(projectName))
                {
                    ExportWithModule(projectName, moduleName, fileName, culture, exportPath, key);
                }
                else
                {
                    var projectToExport = projects
                        .Where(r => string.IsNullOrEmpty(r.ModuleName) || r.ModuleName == moduleName)
                        .Where(r => string.IsNullOrEmpty(r.FileName) || r.FileName == fileName)
                        .Select(r => r.ProjectName)
                        .Intersect(enabledSettings.Projects);

                    foreach (var p in projectToExport)
                    {
                        ExportWithModule(p, moduleName, fileName, culture, exportPath, key);
                    }
                }
            }

            void ExportWithModule(string projectName, string moduleName, string fileName, string culture, string exportPath, string key = null)
            {
                if (!string.IsNullOrEmpty(moduleName))
                {
                    ExportWithFile(projectName, moduleName, fileName, culture, exportPath, key);
                }
                else
                {
                    var moduleToExport = projects
                        .Where(r => r.ProjectName == projectName)
                        .Where(r => string.IsNullOrEmpty(fileName) || r.FileName == fileName)
                        .Select(r => r.ModuleName)
                        .Distinct();

                    foreach (var m in moduleToExport)
                    {
                        ExportWithFile(projectName, m, fileName, culture, exportPath, key);
                    }
                }
            }
            void ExportWithFile(string projectName, string moduleName, string fileName, string culture, string exportPath, string key = null)
            {
                if (!string.IsNullOrEmpty(fileName))
                {
                    ExportWithCulture(projectName, moduleName, fileName, culture, exportPath, key);
                }
                else
                {
                    foreach (var f in projects.Where(r => r.ProjectName == projectName && r.ModuleName == moduleName).Select(r => r.FileName))
                    {
                        ExportWithCulture(projectName, moduleName, f, culture, exportPath, key);
                    }
                }
            }
            void ExportWithCulture(string projectName, string moduleName, string fileName, string culture, string exportPath, string key)
            {
                if (!string.IsNullOrEmpty(culture))
                {
                    export(serviceProvider, projectName, moduleName, fileName, culture, exportPath, key);
                }
                else
                {
                    var resultFiles = new ConcurrentBag<string>();
                    var filePath = "";
                    var asmbl = "";
                    var assmlPath = "";

                    if (key == "*")
                    {
                        filePath = Directory.GetFiles(exportPath, $"{fileName}", SearchOption.AllDirectories).FirstOrDefault();
                        if (string.IsNullOrEmpty(filePath)) return;

                        assmlPath = Path.GetDirectoryName(filePath);

                        var name = Path.GetFileNameWithoutExtension(fileName);
                        var designerPath = Path.Combine(Path.GetDirectoryName(filePath), $"{name}.Designer.cs");
                        var data = File.ReadAllText(designerPath);
                        var regex = new Regex(@"namespace\s(\S*)\s", RegexOptions.IgnoreCase);
                        var matches = regex.Matches(data);
                        if (!matches.Any() || matches[0].Groups.Count < 2)
                        {
                            return;
                        }

                        File.Delete(designerPath);

                        var nsp = matches[0].Groups[1].Value;
                        
                        do
                        {
                            asmbl = Directory.GetFiles(assmlPath, "*.csproj").FirstOrDefault();
                            if (string.IsNullOrEmpty(asmbl))
                            {
                                assmlPath = Path.GetFullPath(Path.Combine(assmlPath, ".."));
                            }
                        }
                        while (string.IsNullOrEmpty(asmbl));

                        regex = new Regex(@"\<AssemblyName\>(\S*)\<\/AssemblyName\>", RegexOptions.IgnoreCase);
                        matches = regex.Matches(File.ReadAllText(asmbl));
                        if (!matches.Any() || matches[0].Groups.Count < 2)
                        {
                            return;
                        }

                        key = CheckExist(fileName, $"{nsp}.{name},{matches[0].Groups[1].Value}", exportPath);
                        exportPath = Path.GetDirectoryName(filePath);
                    }

                    if (string.IsNullOrEmpty(exportPath))
                    {
                        return;
                    }

                    ParallelEnumerable.ForAll(cultures.AsParallel(), c => {
                        var any = export(serviceProvider, projectName, moduleName, fileName, c, exportPath, key);
                        if (any)
                        {
                            resultFiles.Add($"{filePath.Replace(".resx", (c == "Neutral" ? $".resx" : $".{c}.resx"))}".Substring(assmlPath.Length + 1));
                        }
                    });

                    //AddResourceForCsproj(asmbl, filePath.Substring(assmlPath.Length + 1), resultFiles.OrderBy(r=> r));
                }
            }
        }

        public static string CheckExist(string fileName, string fullClassName, string path)
        {
            var resName = Path.GetFileNameWithoutExtension(fileName);
            var bag = new ConcurrentBag<string>();

            var csFiles = Directory.GetFiles(Path.GetFullPath(path), "*.cs", SearchOption.AllDirectories);
            csFiles = csFiles.Concat(Directory.GetFiles(Path.GetFullPath(path), "*.aspx", SearchOption.AllDirectories)).ToArray();
            csFiles = csFiles.Concat(Directory.GetFiles(Path.GetFullPath(path), "*.ascx", SearchOption.AllDirectories)).ToArray();
            csFiles = csFiles.Concat(Directory.GetFiles(Path.GetFullPath(path), "*.html", SearchOption.AllDirectories)).ToArray();
            csFiles = csFiles.Concat(Directory.GetFiles(Path.GetFullPath(path), "*.js", SearchOption.AllDirectories).Where(r => !r.Contains("node_modules"))).ToArray();
            var xmlFiles = Directory.GetFiles(Path.GetFullPath(path), "*.xml", SearchOption.AllDirectories);

            string localInit() => "";

            Func<string, ParallelLoopState, long, string, string> func(string regexp) => (f, state, index, a) =>
            {
                var data = File.ReadAllText(f);
                var regex = new Regex(regexp, RegexOptions.IgnoreCase);
                var matches = regex.Matches(data);
                if (matches.Count > 0)
                {
                    return a + "," + string.Join(",", matches.Select(r => r.Groups[1].Value));
                }
                return a;
            };

            void localFinally(string r)
            {
                if (!bag.Contains(r) && !string.IsNullOrEmpty(r))
                {
                    bag.Add(r.Trim(','));
                }
            }

            _ = Parallel.ForEach(csFiles, localInit, func(@$"\W+{resName}\.(\w*)"), localFinally);
            _ = Parallel.ForEach(csFiles, localInit, func(@$"CustomNamingPeople\.Substitute\<{resName}\>\(""(\w*)""\)"), localFinally);
            _ = Parallel.ForEach(xmlFiles, localInit, func(@$"\|(\w*)\|{fullClassName.Replace(".", "\\.")}"), localFinally);

            return string.Join(',', bag.ToArray().Distinct());
        }

        private static void AddResourceForCsproj(string csproj, string fileName, IEnumerable<string> files)
        {
            if (!files.Any()) return;

            var doc = XDocument.Parse(File.ReadAllText(csproj));
            if (doc.Root == null) return;

            foreach (var file in files)
            {
                var node = doc.Root.Elements().FirstOrDefault(r => 
                r.Name == ItemGroupXname &&
                r.Elements(EmbededXname).Any(x=>
                {
                    var attr = x.Attribute(IncludeAttribute);
                    return attr != null && attr.Value == fileName;
                })) ?? 
                doc.Root.Elements().FirstOrDefault(r =>
                r.Name == ItemGroupXname &&
                r.Elements(EmbededXname).Any());

                XElement reference;
                bool referenceNotExist;

                if (node == null)
                {
                    node = new XElement(ItemGroupXname);
                    doc.Root.Add(node);
                    reference = new XElement(EmbededXname);
                    referenceNotExist = true;
                }
                else
                {
                    var embeded = node.Elements(EmbededXname).ToList();

                    reference = embeded.FirstOrDefault(r =>
                    {
                        var attr = r.Attribute(IncludeAttribute);
                        return attr != null && attr.Value == file;
                    });

                    referenceNotExist = reference == null;
                    if (referenceNotExist)
                    {
                        reference = new XElement(EmbededXname);
                        if (file != fileName)
                        {
                            reference.Add(new XElement(DependentUpon, Path.GetFileName(fileName)));
                        }
                    }
                }

                if (referenceNotExist)
                {
                    reference.SetAttributeValue(IncludeAttribute, file);
                    node.Add(reference);
                }
            }

            doc.Save(csproj);
        }
    }

    [Scope]
    public class ProgramScope
    {
        internal ResourceData ResourceData { get; }
        internal ConfigurationExtension Configuration { get; }

        public ProgramScope(ResourceData resourceData, ConfigurationExtension configuration)
        {
            ResourceData = resourceData;
            Configuration = configuration;
        }
    }
}
