using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WebRole.Extensions
{
    public static class UrlHelperExtensions
    {
        public static MvcHtmlString StaticCdnUrl(this UrlHelper helper, string path)
        {
#if DEBUG
            // don't use the cdn in debug
            string url = path;
#else
            string url = AppendPath("http://static.agent8ball.com", path);
#endif

            return MvcHtmlString.Create(
                HttpUtility.UrlPathEncode(url));
        }

        public static MvcHtmlString StaticCdnGzipAwareUrl(this UrlHelper helper, string path)
        {
#if DEBUG
            // don't use the cdn in debug
            string url = path;
#else
            string url = AppendPath("http://static.agent8ball.com", path);
#endif
            return MvcHtmlString.Create(
                    HttpUtility.UrlPathEncode(
                        helper.GZipAwareUrl(url)));
        }

        private static string AppendPath(string baseUrl, string path)
        {
            if (String.IsNullOrEmpty(path) || path[0] == '/')
                return baseUrl + path;

            return baseUrl + "/" + path;
        }

        /// <summary>
        ///   Appends .gz to the end of the url if the current request supports gzip.
        ///   Example usage in MVC html:
        ///   <%: Url.GZipAwareUrl("http://cdn.domain.com/script.js") %>
        /// </summary>
        public static string GZipAwareUrl(this UrlHelper helper, string url)
        {
#if DEBUG
            // cdn isn't in use for debug
            return url;
#endif

            bool supportsGZip =
                helper.RequestContext != null &&
                helper.RequestContext.HttpContext != null &&
                helper.RequestContext.HttpContext.Request != null &&
                helper.RequestContext.HttpContext.Request.SupportsGZip();

            if (supportsGZip)
            {
                return url + ".gz";
            }

            return url;
        }
    }

    public static class HttpRequestExtensions
    {
        /// <summary>
        ///   Returns true if the current request accepts gzip compressed responses
        /// </summary>
        public static bool SupportsGZip(this HttpRequestBase request)
        {
            string encoding = request.Headers["Accept-Encoding"];
            if (!string.IsNullOrEmpty(encoding) && encoding.Contains("gzip"))
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        /// <summary>
        ///   Returns true if the current request accepts gzip compressed responses
        /// </summary>
        public static bool SupportsGZip(this HttpRequest request)
        {
            string encoding = request.Headers["Accept-Encoding"];
            if (!string.IsNullOrEmpty(encoding) && encoding.Contains("gzip"))
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}