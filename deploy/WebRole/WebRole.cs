using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.WindowsAzure;
using Microsoft.WindowsAzure.Diagnostics;
using Microsoft.WindowsAzure.ServiceRuntime;

namespace WebRole
{
    public class WebRole : RoleEntryPoint
    {
        public override bool OnStart()
        {
            CrashDumps.EnableCollection(enableFullDumps: false);

            var config = DiagnosticMonitor.GetDefaultInitialConfiguration();

            config.PerformanceCounters.DataSources.Add(
                new PerformanceCounterConfiguration()
                {
                    CounterSpecifier = @"\Processor(_Total)\% Processor Time",
                    SampleRate = TimeSpan.FromMinutes(5)
                });

            config.PerformanceCounters.DataSources.Add(
                new PerformanceCounterConfiguration()
                {
                    CounterSpecifier = @"\ASP.NET Applications(__Total__)\Requests/Sec",
                    SampleRate = TimeSpan.FromMinutes(5)
                });

            // set scheduled transfer period
            config.PerformanceCounters.ScheduledTransferPeriod = TimeSpan.FromMinutes(10);
            config.Directories.ScheduledTransferPeriod = TimeSpan.FromMinutes(10); // iis logs and crash dumps


            DiagnosticMonitor.Start("DiagnosticsConnectionString", config);

            // For information on handling configuration changes
            // see the MSDN topic at http://go.microsoft.com/fwlink/?LinkId=166357.
            RoleEnvironment.Changing += RoleEnvironmentChanging;

            return base.OnStart();
        }

        private void RoleEnvironmentChanging(object sender, RoleEnvironmentChangingEventArgs e)
        {
            // If a configuration setting is changing
            if (e.Changes.Any(change => change is RoleEnvironmentConfigurationSettingChange))
            {
                // Set e.Cancel to true to restart this role instance
                e.Cancel = true;
            }
        }
    }
}
