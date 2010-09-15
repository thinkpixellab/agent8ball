using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using WebRole.Extensions;

namespace WebRole
{
    public class MvcApplication : System.Web.HttpApplication
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("favicon.ico");
            routes.IgnoreRoute("stylesheets/{*path}");
            routes.IgnoreRoute("javascripts/{*path}");
            routes.IgnoreRoute("sounds/{*path}");
            routes.IgnoreRoute("images/{*path}");

            routes.MapRoute(
                "Default", // Route name
                "{action}", // URL with parameters
                new { controller = "Home", action = "Index" } // Parameter defaults
            );
        }

        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            RegisterRoutes(RouteTable.Routes);
        }

        public override string GetVaryByCustomString(HttpContext context, string custom)
        {
            if (custom == "gzip")
            {
                if (context.Request.SupportsGZip())
                {
                    return "gzip";
                }

                return String.Empty;
            }

            return base.GetVaryByCustomString(context, custom);
        }
    }
}