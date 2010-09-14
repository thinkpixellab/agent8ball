using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.WindowsAzure.StorageClient;
using Microsoft.WindowsAzure;
using System.IO;
using System.IO.Compression;
using System.Diagnostics;

namespace CdnUtility
{
    public static class CloudBlobUtility
    {
        const string CacheControlMaxExpiration = "public, max-age=2147483648"; // about 68 years
        const string CacheControlOneHourExpiration = "public, max-age=3600"; // 1 hr

        static BlobRequestOptions FlatListingRequestOptions =
            new BlobRequestOptions() { UseFlatBlobListing = true };

        public static string GetPublicCacheControlHeader(TimeSpan expiration)
        {
            long expirationSeconds = (long)expiration.TotalSeconds;
            if (expirationSeconds > Int32.MaxValue)
            {
                // old versions of IE only support 32-bit int
                throw new ArgumentException("Expiration cannot exceed 2,147,483,647 seconds");
            }

            return "public, max-age=" + expirationSeconds.ToString();
        }


        /// <summary>
        ///   Iterates through each blob in the specified container and adds the
        ///   Cache-Control and ContentType headers
        /// </summary>
        public static void EnsureStaticFileHeaders(
            CloudBlobContainer container,
            string cacheControlHeader = CacheControlOneHourExpiration)
        {

            foreach (var blobInfo in container.ListBlobs(FlatListingRequestOptions))
            {
                // get the blob properties and set headers if necessary
                CloudBlob blob = container.GetBlobReference(blobInfo.Uri.ToString());
                blob.FetchAttributes();
                var properties = blob.Properties;

                bool wasModified = false;

                // see if a content type is defined for the extension
                string extension = Path.GetExtension(blobInfo.Uri.LocalPath);
                string contentType = GetContentType(extension);
                if (String.IsNullOrEmpty(contentType))
                {
                    Trace.TraceWarning("Content type not found for extension:" + extension);
                }
                else
                {
                    if (properties.ContentType != contentType)
                    {
                        properties.ContentType = contentType;
                        wasModified = true;
                    }
                }

                if (properties.CacheControl != cacheControlHeader)
                {
                    properties.CacheControl = cacheControlHeader;
                    wasModified = true;
                }

                if (wasModified)
                {
                    blob.SetProperties();
                }
            }
        }

        /// <summary>
        ///   Finds all js and css files in a container and creates a gzip compressed
        ///   copy of the file with ".gz" appended to the existing blob name
        /// </summary>
        public static void EnsureGzipFiles(
            CloudBlobContainer container,
            string cacheControlHeader = CacheControlOneHourExpiration)
        {
            foreach (var blobInfo in container.ListBlobs(FlatListingRequestOptions))
            {
                string blobUrl = blobInfo.Uri.ToString();
                CloudBlob blob = container.GetBlobReference(blobUrl);

                // see if a content type is defined for the extension
                string extension = Path.GetExtension(blobInfo.Uri.LocalPath);
                if (extension == ".css" || extension == ".js")
                {
                    string gzipUrl = blobUrl + ".gz";
                    CloudBlob gzipBlob = container.GetBlobReference(gzipUrl);
                    if (!gzipBlob.Exists())
                    {
                        // create a gzip version of the file
                        using (MemoryStream memoryStream = new MemoryStream())
                        {
                            // push the original blob into the gzip stream
                            using (GZipStream gzipStream = new GZipStream(memoryStream, CompressionMode.Compress))
                            using (BlobStream blobStream = blob.OpenRead())
                            {
                                blobStream.CopyTo(gzipStream);
                            }

                            // the gzipStream MUST be closed before its safe to read from the memory stream
                            byte[] compressedBytes = memoryStream.ToArray();

                            // upload the compressed bytes to the new blob
                            gzipBlob.UploadByteArray(compressedBytes);

                            // set the blob headers
                            gzipBlob.Properties.CacheControl = cacheControlHeader;
                            gzipBlob.Properties.ContentType = GetContentType(extension);
                            gzipBlob.Properties.ContentEncoding = "gzip";
                            gzipBlob.SetProperties();
                        }
                    }
                }
            }
        }

        /// <summary>
        ///   Gets the content type for the specified extension
        /// </summary>
        public static string GetContentType(string extension)
        {
            switch (extension.ToLowerInvariant())
            {
                case ".jpg":
                case ".jpeg":
                    return "image/jpeg";
                case ".png":
                    return "image/png";
                case ".gif":
                    return "image/gif";
                case ".ico":
                    return "image/x-icon";
                case ".css":
                    return "text/css";
                case ".js":
                    return "text/javascript";
                case ".svg":
                    return "image/svg+xml";
                case ".mp3":
                    return "audio/mpeg";
                case ".mp4":
                    return "video/mp4";
                case ".eot":
                    return "application/vnd.ms-fontobject";
                case ".woff":
                    return "application/x-woff";
                case ".ttf":
                    return "font/ttf";
                case ".otf":
                    return "font/otf";
            }

            return null;
        }

        public static bool Exists(this CloudBlob blob)
        {
            try
            {
                blob.FetchAttributes();
                return true;
            }
            catch (StorageClientException e)
            {
                if (e.ErrorCode == StorageErrorCode.ResourceNotFound)
                {
                    return false;
                }
                else
                {
                    throw;
                }
            }
        }

        public static bool Exists(this CloudBlobContainer container)
        {
            try
            {
                container.FetchAttributes();
                return true;
            }
            catch (StorageClientException e)
            {
                if (e.ErrorCode == StorageErrorCode.ResourceNotFound)
                {
                    return false;
                }
                else
                {
                    throw;
                }
            }
        }
    }
}
