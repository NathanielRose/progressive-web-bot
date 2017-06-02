using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Extractor
{
    class Program
    {
        static void Main(string[] args)
        {
            ExtractData();
            Console.ReadLine();
        }

        private static void AddParameter(System.Data.SqlClient.SqlCommand com, string name, string value)
        {
            System.Data.SqlClient.SqlParameter p;
            p = com.CreateParameter();
            p.ParameterName = name;

            p.Value = value;
            com.Parameters.Add(p);
        }
        private static object DBNullCheck(string value)
        {
            if (string.IsNullOrEmpty(value))
                return System.DBNull.Value;
            else
                return value;
        }
        private static void AddParameter(System.Data.SqlClient.SqlCommand com, string name, decimal? value)
        {
            System.Data.SqlClient.SqlParameter p;
            p = com.CreateParameter();
            p.ParameterName = name;

            p.Value = value;
            com.Parameters.Add(p);
        }
        private static void AddParameter(System.Data.SqlClient.SqlCommand com, string name, DateTime value)
        {
            System.Data.SqlClient.SqlParameter p;
            p = com.CreateParameter();
            p.ParameterName = name;
            p.Value = value;
            com.Parameters.Add(p);
        }
        static async void ExtractData()
        {
            System.Data.SqlClient.SqlConnection con = new System.Data.SqlClient.SqlConnection("Server=tcp:harvardmuseum.database.windows.net,1433;Initial Catalog=HarvardMuseumDB;Persist Security Info=False;User ID=adminmat;Password=P@ssw0rd1;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;");
            con.Open();
            System.Data.SqlClient.SqlCommand com = CreateCommand(con);


            HttpClient httpClient = new HttpClient();

            await ExtractData("da vinci", com, httpClient);

            await ExtractData("picasso",com, httpClient);
            await ExtractData("monet", com, httpClient);
            await ExtractData("rembrandt", com, httpClient);
            await ExtractData("michelangelo ", com, httpClient);
            await ExtractData("raphael ", com, httpClient);
            await ExtractData("renoir ", com, httpClient);

        }

        private static async Task ExtractData(string topic, System.Data.SqlClient.SqlCommand com, HttpClient httpClient)
        {
            string payload = await httpClient.GetStringAsync("http://api.harvardartmuseums.org/object?apikey=e4f1e400-08da-11e7-ad3b-f39f51a45af0&worktype=238&q=" + topic);
            JObject o = JObject.Parse(payload);
            int numPages = o["info"]["pages"].Value<Int32>();
            JArray a = (JArray)o["records"];

            for (int count = 2; count <= numPages; count++)
            {
                await IterateRecords(com, a);

                payload = await httpClient.GetStringAsync("http://api.harvardartmuseums.org/object?apikey=e4f1e400-08da-11e7-ad3b-f39f51a45af0&worktype=238&q=" + topic + "&page=" + count.ToString());
                o = JObject.Parse(payload);
                a = (JArray)o["records"];

            }
        }

        private static async Task IterateRecords(System.Data.SqlClient.SqlCommand com, JArray a)
        {
            foreach (JToken item in a)
            {
                com.Parameters["@accessionyear"].Value = DBNullCheck(item["accessionyear"].Value<string>());
                com.Parameters["@technique"].Value = DBNullCheck(item["technique"].Value<string>());
                com.Parameters["@mediacount"].Value = item["mediacount"].Value<Int32>();
                com.Parameters["@edition"].Value = DBNullCheck(item["edition"].Value<string>());
                com.Parameters["@totalpageviews"].Value = item["totalpageviews"].Value<Int32>();
                com.Parameters["@groupcount"].Value = item["groupcount"].Value<Int32>();

                com.Parameters["@people"].Value = item["people"]==null?DBNull.Value: DBNullCheck(string.Join(",", from person in (JArray)item["people"]
                                                                               select person["name"].Value<string>()));

                com.Parameters["@objectnumber"].Value = DBNullCheck(item["objectnumber"].Value<string>());
                com.Parameters["@colorcount"].Value = item["colorcount"].Value<Int32>();
                com.Parameters["@lastupdate"].Value = item["lastupdate"].Value<DateTime>();
                com.Parameters["@rank"].Value = item["rank"].Value<Int32>();
                com.Parameters["@imagecount"].Value = item["imagecount"].Value<Int32>();
                com.Parameters["@description"].Value = DBNullCheck(item["description"].Value<string>());
                com.Parameters["@dateoflastpageview"].Value = item["dateoflastpageview"].Value<DateTime>();
                com.Parameters["@dateoffirstpageview"].Value = item["dateoffirstpageview"].Value<DateTime>();
                com.Parameters["@primaryimageurl"].Value = item["primaryimageurl"]==null?DBNull.Value: DBNullCheck(item["primaryimageurl"].Value<string>());
                com.Parameters["@colors"].Value = item["colors"]==null?DBNull.Value : DBNullCheck(string.Join(",", from color in (JArray)item["colors"]
                                                                               select color["color"].Value<string>()));
                com.Parameters["@dated"].Value = DBNullCheck(item["dated"].Value<string>());
                com.Parameters["@contextualtextcount"].Value = item["contextualtextcount"].Value<Int32>();
                com.Parameters["@copyright"].Value = DBNullCheck(item["copyright"].Value<string>());
                com.Parameters["@period"].Value = DBNullCheck(item["period"].Value<string>());
                com.Parameters["@url"].Value = DBNullCheck(item["url"].Value<string>());
                com.Parameters["@provenance"].Value = DBNullCheck(item["provenance"].Value<string>());
                com.Parameters["@images"].Value = DBNull.Value; // item["images"].Value<string>();
                com.Parameters["@publicationcount"].Value = item["publicationcount"].Value<Int32>();
                com.Parameters["@objectid"].Value = item["objectid"].Value<Int32>();
                com.Parameters["@culture"].Value = DBNullCheck(item["culture"].Value<string>());
                com.Parameters["@verificationleveldescription"].Value = DBNullCheck(item["verificationleveldescription"].Value<string>());
                com.Parameters["@standardreferencenumber"].Value = DBNullCheck(item["standardreferencenumber"].Value<string>());
                com.Parameters["@worktypeid"].Value = ((JArray)item["worktypes"])[0]["worktypeid"].Value<Int32>();
                com.Parameters["@worktype"].Value = DBNullCheck(((JArray)item["worktypes"])[0]["worktype"].Value<string>());
                com.Parameters["@department"].Value = DBNullCheck(item["department"].Value<string>());
                com.Parameters["@state"].Value = DBNullCheck(item["state"].Value<string>());
                com.Parameters["@markscount"].Value = item["markscount"].Value<Int32>();
                com.Parameters["@contact"].Value = DBNullCheck(item["contact"].Value<string>());
                com.Parameters["@titlescount"].Value = item["titlescount"].Value<Int32>();
                com.Parameters["@id"].Value = item["id"].Value<Int32>();
                com.Parameters["@title"].Value = DBNullCheck(item["title"].Value<string>());
                com.Parameters["@verificationlevel"].Value = item["verificationlevel"].Value<Int32>();
                com.Parameters["@division"].Value = DBNullCheck(item["division"].Value<string>());
                com.Parameters["@style"].Value = DBNullCheck(item["style"].Value<string>());
                com.Parameters["@commentary"].Value = DBNullCheck(item["commentary"].Value<string>());
                com.Parameters["@relatedcount"].Value = item["relatedcount"].Value<Int32>();
                com.Parameters["@datebegin"].Value = item["datebegin"].Value<Int32>();
                com.Parameters["@labeltext"].Value = DBNullCheck(item["labeltext"].Value<string>());
                com.Parameters["@totaluniquepageviews"].Value = item["totaluniquepageviews"].Value<Int32>();
                com.Parameters["@dimensions"].Value = DBNullCheck(item["dimensions"].Value<string>());
                com.Parameters["@exhibitioncount"].Value = item["exhibitioncount"].Value<Int32>();
                com.Parameters["@techniqueid"].Value = DBNullCheck(item["techniqueid"].Value<string>());
                com.Parameters["@totalpageviews"].Value = item["totalpageviews"].Value<Int32>();
                com.Parameters["@dateend"].Value = item["dateend"].Value<Int32>();
                com.Parameters["@creditline"].Value = DBNullCheck(item["creditline"].Value<string>());
                com.Parameters["@imagepermissionlevel"].Value = item["imagepermissionlevel"].Value<Int32>();
                com.Parameters["@signed"].Value = DBNullCheck(item["signed"].Value<string>());
                com.Parameters["@century"].Value = DBNullCheck(item["century"].Value<string>());
                com.Parameters["@classificationid"].Value = item["classificationid"].Value<Int32>();
                com.Parameters["@medium"].Value = DBNullCheck(item["medium"].Value<string>());
                com.Parameters["@peoplecount"].Value = item["peoplecount"].Value<Int32>();
                com.Parameters["@accesslevel"].Value = item["accesslevel"].Value<Int32>();
                com.Parameters["@classification"].Value = DBNullCheck(item["classification"].Value<string>());
                try
                {
                    await com.ExecuteNonQueryAsync();
                }
                catch
                {

                }
            }
        }

        private static System.Data.SqlClient.SqlCommand CreateCommand(System.Data.SqlClient.SqlConnection con)
        {
            System.Data.SqlClient.SqlCommand com = new System.Data.SqlClient.SqlCommand("delete from dbo.records", con);
            com.ExecuteNonQuery();
            com = new System.Data.SqlClient.SqlCommand("insert into dbo.Records( " +
    "[accessionyear],[technique],[mediacount],[edition],[totalpageviews],[groupcount],[people],[objectnumber],[colorcount],[lastupdate], " +
    "[rank], [imagecount],[description],[dateoflastpageview],[dateoffirstpageview],[primaryimageurl] ,[colors] ,[dated],[contextualtextcount],[copyright],[period],[url],[provenance],[images],[publicationcount], " +
    "[objectid], [culture],[verificationleveldescription], [standardreferencenumber],[worktypeid],[worktype] ,[department],[state],[markscount],[contact],[titlescount],[id],[title],[verificationlevel],[division],[style],[commentary],[relatedcount],[datebegin],[labeltext], " +
    "[totaluniquepageviews],[dimensions],[exhibitioncount],[techniqueid],[dateend],[creditline],[imagepermissionlevel],[signed],[century],[classificationid],[medium],[peoplecount],[accesslevel],[classification])" +
    "values(" +
    "@accessionyear,@technique,@mediacount,@edition,@totalpageviews,@groupcount,@people,@objectnumber,@colorcount,@lastupdate, " +
    "@rank, @imagecount,@description,@dateoflastpageview,@dateoffirstpageview,@primaryimageurl ,@colors ,@dated,@contextualtextcount,@copyright,@period,@url,@provenance,@images,@publicationcount, " +
    "@objectid, @culture,@verificationleveldescription, @standardreferencenumber,@worktypeid,@worktype ,@department,@state,@markscount,@contact,@titlescount,@id,@title,@verificationlevel,@division,@style,@commentary,@relatedcount,@datebegin,@labeltext, " +
    "@totaluniquepageviews,@dimensions,@exhibitioncount,@techniqueid,@dateend,@creditline,@imagepermissionlevel,@signed,@century,@classificationid,@medium,@peoplecount,@accesslevel,@classification)"
    , con);

            AddParameter(com, "@accessionyear", 0);
            AddParameter(com, "@technique", "");
            AddParameter(com, "@mediacount", 0);
            AddParameter(com, "@edition", "");
            AddParameter(com, "@totalpageviews", 0);
            AddParameter(com, "@groupcount", 0);
            AddParameter(com, "@people", "");
            AddParameter(com, "@objectnumber", "");
            AddParameter(com, "@colorcount", 0);
            AddParameter(com, "@lastupdate", DateTime.Now);
            AddParameter(com, "@rank", 0);
            AddParameter(com, "@imagecount", 0);
            AddParameter(com, "@description", "");
            AddParameter(com, "@dateoflastpageview", DateTime.Now);
            AddParameter(com, "@dateoffirstpageview", DateTime.Now);
            AddParameter(com, "@primaryimageurl", "");
            AddParameter(com, "@colors", "");
            AddParameter(com, "@dated", 0);
            AddParameter(com, "@contextualtextcount", 0);
            AddParameter(com, "@copyright", "");
            AddParameter(com, "@period", "");
            AddParameter(com, "@url", "");
            AddParameter(com, "@provenance", "");
            AddParameter(com, "@images", "");
            AddParameter(com, "@publicationcount", 0);
            AddParameter(com, "@objectid", 0);
            AddParameter(com, "@culture", "");
            AddParameter(com, "@verificationleveldescription", "");
            AddParameter(com, "@standardreferencenumber", "");
            AddParameter(com, "@worktypeid", 0);
            AddParameter(com, "@worktype", "");
            AddParameter(com, "@department", "");
            AddParameter(com, "@state", "");
            AddParameter(com, "@markscount", 0);
            AddParameter(com, "@contact", "");
            AddParameter(com, "@titlescount", 0);
            AddParameter(com, "@id", 1);
            AddParameter(com, "@title", "");
            AddParameter(com, "@verificationlevel", 0);
            AddParameter(com, "@division", "");
            AddParameter(com, "@style", "");
            AddParameter(com, "@commentary", "");
            AddParameter(com, "@relatedcount", 0);
            AddParameter(com, "@datebegin", 0);
            AddParameter(com, "@labeltext", "");
            AddParameter(com, "@totaluniquepageviews", 0);
            AddParameter(com, "@dimensions", "");
            AddParameter(com, "@exhibitioncount", 0);
            AddParameter(com, "@techniqueid", "");
            AddParameter(com, "@dateend", 0);
            AddParameter(com, "@creditline", "");
            AddParameter(com, "@imagepermissionlevel", 0);
            AddParameter(com, "@signed", "");
            AddParameter(com, "@century", "");
            AddParameter(com, "@classificationid", 0);
            AddParameter(com, "@medium", "");
            AddParameter(com, "@peoplecount", 0);
            AddParameter(com, "@accesslevel", 0);
            AddParameter(com, "@classification", "");
            return com;
        }
    }
}
