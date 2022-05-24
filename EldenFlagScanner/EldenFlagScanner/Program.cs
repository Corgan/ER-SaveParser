using System;
using System.Collections.Generic;
using SoulMemory.EldenRing;

namespace cli
{
    internal class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Custom eventFlag scanner built using https://github.com/FrankvdStam/SoulSplitter/tree/main/src/SoulMemory");
            var er = new EldenRing();
            Console.WriteLine("Waiting to Attach");
            while (er.Refresh() == false)
            {
                Thread.Sleep(500);
            }

            Console.WriteLine("Attached");
            er.Init();

            Console.WriteLine("Scanning for Changes");
            while(true) {
                Dictionary<int, bool> changed = er.ScanForChanges();
                String output = "";
                foreach (KeyValuePair<int, bool> kvp in changed) {
                    output += $"{DateTime.Now.ToString("hh:mm:ss.fff")} {kvp.Key,12} = {kvp.Value,5}\n";
                }
                if(output != "") {
                    Console.WriteLine(output);
                    File.AppendAllText(Path.Combine(Directory.GetCurrentDirectory(), @"EldenFlagScannerLog.txt"), output);
                }

                if(er.Refresh() == false) {
                    Console.WriteLine("Closed. Waiting to Re-Attach");
                    while (er.Refresh() == false) {
                        Thread.Sleep(500);
                    }

                    Console.WriteLine("Attached");
                    er.Init();

                    Console.WriteLine("Scanning for Changes");
                }
            }
        }
    }
}
