using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.WindowsAzure;
using Microsoft.WindowsAzure.StorageClient;
using System.IO;
using System.IO.Compression;

namespace CdnUtility
{
    class Program
    {
        static void Main(string[] args)
        {
            // get the blob clients
            var soundsBlobClient = GetSoundsBlobClient();
            var staticBlobClient = GetStaticBlobClient();

            string cacheControlHeader = CloudBlobUtility.GetPublicCacheControlHeader(
                TimeSpan.FromMinutes(5));

            // set the headers for images and sounds
            CloudBlobUtility.EnsureStaticFileHeaders(
                staticBlobClient.GetContainerReference("images"),
                cacheControlHeader);
            CloudBlobUtility.EnsureStaticFileHeaders(
                soundsBlobClient.GetContainerReference("sounds"),
                cacheControlHeader);

            // set headers for non-gziped js and css
            var fontsContainer = staticBlobClient.GetContainerReference("fonts");
            var jsContainer = staticBlobClient.GetContainerReference("javascripts");
            var cssContainer = staticBlobClient.GetContainerReference("stylesheets");
            CloudBlobUtility.EnsureStaticFileHeaders(
                fontsContainer,
                cacheControlHeader);
            CloudBlobUtility.EnsureStaticFileHeaders(
                jsContainer,
                cacheControlHeader);
            CloudBlobUtility.EnsureStaticFileHeaders(
                cssContainer,
                cacheControlHeader);

            // create gzip versions for css and js files
            CloudBlobUtility.EnsureGzipFiles(
                fontsContainer,
                cacheControlHeader);
            CloudBlobUtility.EnsureGzipFiles(
                jsContainer,
                cacheControlHeader);
            CloudBlobUtility.EnsureGzipFiles(
                cssContainer,
                cacheControlHeader);
        }

        static CloudBlobClient GetSoundsBlobClient()
        {
            var storageAccount = new CloudStorageAccount(
                new StorageCredentialsAccountAndKey(
                    accountName: "eightballsounds",
                    key: "W4srBKO6rZQweSgqP+hgwMHbmwG/v54T3VTP0DNU0QWPYhGrLWtBNOpIclLoTNmYHULFMPHyHrLfebHvzVetMQ=="),
                useHttps: true);
            return storageAccount.CreateCloudBlobClient();
        }

        static CloudBlobClient GetStaticBlobClient()
        {
            var storageAccount = new CloudStorageAccount(
                new StorageCredentialsAccountAndKey(
                    accountName: "eightballstatic",
                    key: "e/eavmsyY0rj3Y345D7XflhPxmaKZ92ggVGHO9B/Ty+Y6C952qELVb+OGs3m1EanR1NZlDlELLIXxhpIAVC+hw=="),
                useHttps: true);
            return storageAccount.CreateCloudBlobClient();
        }
    }
}
