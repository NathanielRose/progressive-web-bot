using Blynclight;
using Newtonsoft.Json;
using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;

namespace DevOps.Statut
{
    class Program
    {
        static private BlynclightController oBlynclightController = new BlynclightController();
        
        static void Main(string[] args)
        {
            oBlynclightController.InitBlyncDevices();
            oBlynclightController.ResetLight(0);
            while (true)
            {
                var latestBuilds = GetBuilds();

                if (latestBuilds == null || latestBuilds.count == 0)
                {
                    oBlynclightController.ResetLight(0);
                }

                var latest = latestBuilds.Builds.First();

                if (latest.status.Equals("Completed", StringComparison.InvariantCultureIgnoreCase) && latest.result.Equals("Succeeded", StringComparison.InvariantCultureIgnoreCase))
                {
                    oBlynclightController.TurnOnGreenLight(0);

                }

                if (latest.status.Equals("InProgress", StringComparison.InvariantCultureIgnoreCase))
                {
                    oBlynclightController.TurnOnMagentaLight(0);

                }

                if (latest.status.Equals("Completed", StringComparison.InvariantCultureIgnoreCase) && latest.result.Equals("Failed", StringComparison.InvariantCultureIgnoreCase))
                {
                    oBlynclightController.TurnOnRedLight(0);

                }

                Thread.Sleep(5000);
            }
        }

        public static GetBuildsResponse GetBuilds()
        {
            try
            {
                var username = "pierlagmsft";
                var password = "*****";

                using (HttpClient client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Accept.Add(
                        new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic",
                        Convert.ToBase64String(
                            System.Text.ASCIIEncoding.ASCII.GetBytes(
                                string.Format("{0}:{1}", username, password))));

                    string buildsUrl = "https://pierlagmsft.visualstudio.com/DefaultCollection/progressive-web-bot/_apis/build/builds?api-version=2.0&$top=1";
                    using (HttpResponseMessage response = client.GetAsync(buildsUrl).Result)
                    {
                        response.EnsureSuccessStatusCode();
                        string responseBody = response.Content.ReadAsStringAsync().Result;

                        return JsonConvert.DeserializeObject<GetBuildsResponse>(responseBody);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                return null;
            }
        }
    }
}
