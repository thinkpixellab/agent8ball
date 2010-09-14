using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WebRole.Controllers
{
    [HandleError]
    public class HomeController : Controller
    {
        [OutputCache(Duration = 3600, VaryByParam = "none", VaryByCustom = "gzip")]
        public ActionResult Index()
        {
            return View();
        }

        protected override void HandleUnknownAction(string actionName)
        {
            this.Response.StatusCode = 404;
            this.View("NotFound").ExecuteResult(this.ControllerContext);
        }
    }
}
