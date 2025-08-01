<script lang="ts">
    import { docTitle, plotTitle } from "./data";

    document.getElementsByTagName("footer")[0]?.classList.add("footer-about")

    $docTitle = "PlotlyShare ● About"
    $plotTitle = "About"
</script>

<!-- <div class="w-full h-[calc(100vh-6rem-2rem-20px)] overflow-y-auto"> -->
<div class="prose w-1/2 min-w-96 max-w-5xl mx-auto my-4">
    <div class="divider divider-secondary">About</div>
    <h1>PlotlyShare</h1>
    is an open source project to facilitate the seamless sharing of interactive <code>plotly</code> plots, 
    providing a similar experience to <span class="line-through">google</span> docs/etc. 

    Download the python package to be able to upload your plots.

    <h2>a11y</h2>
    I've tried my best to make this dashboard accesible, by using best practices where I could. Using Svelte eased
    this process significantly. I would also want to mention <a href="https://github.com/tofsjonas/sortable"><code>sortable.a11y.min.js</code></a>,
    which adds accessibility to the main table view in the dashboard.

    <div class="divider divider-secondary">Privacy Policy</div>
    <h1 id="privacy-policy-for-plotlyshare">Privacy Policy for PlotlyShare</h1>
    <p><strong>Effective Date:</strong> 2025-07-29 <br /><strong>Last Updated:</strong> 2025-07-29</p>
    
    
    <h2 id="introduction">Introduction</h2>
    <p>
        PlotlyShare ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy
        explains how we collect, use, and safeguard your information when you use our open-source application
        available at
        <a class="link link-primary link-hover" href="https://plotlyshare.pages.dev">
            https://plotlyshare.pages.dev</a> (the "Service").
    </p>


    <h2 id="information-we-collect">Information We Collect</h2>
    <h3 id="google-account-information">Google Account Information</h3>
    <p>When you sign in with Google, we collect and store:</p>
    <ul>
        <li>Your name (as provided by Google)</li>
        <li>Your email address</li>
        <li>Your profile picture</li>
    </ul>
    <h3 id="plot-metadata">Plot Metadata</h3>
    <p>When you upload plots through our Service, we store:</p>
    <ul>
        <li>Plot name/title</li>
        <li>Upload timestamp</li>
        <li>Google Drive location link for accessing your plot</li>
        <li>Plot visibility settings (public/private)</li>
    </ul>
    <h3 id="what-we-don-t-collect">What We Don't Collect</h3>
    <ul>
        <li>We do not store your actual plot files or data</li>
        <li>We do not collect browsing history or usage analytics</li>
        <li>We do not use cookies for tracking purposes</li>
        <li>We do not collect device information or location data</li>
    </ul>

    
    <h2 id="how-we-use-your-information">How We Use Your Information</h2>
    <h3 id="google-account-information">Google Account Information</h3>
    <p>Your Google-provided information is used solely to:</p>
    <ul>
        <li>Authenticate your identity</li>
        <li>Display your name and profile picture within the application</li>
        <li>Associate your uploaded plots with your account</li>
        <li>Improve your user experience</li>
    </ul>
    <h3 id="plot-metadata">Plot Metadata</h3>
    <p>Plot metadata is used to:</p>
    <ul>
        <li>Enable you to manage your uploaded plots</li>
        <li>Provide access to your plots when requested</li>
        <li>Display plot information to authorized viewers</li>
    </ul>


    <h2 id="data-storage-and-access">Data Storage and Access</h2>
    <h3 id="your-plot-files">Your Plot Files</h3>
    <ul>
        <li>Your actual plot files are stored in <strong>your own Google Drive</strong></li>
        <li>We do not have access to or store your plot content</li>
        <li>Plot files remain under your complete control in your Google Drive</li>
    </ul>
    <h3 id="plot-access">Plot Access</h3>
    <ul>
        <li>Plots are only fetched from your Google Drive when someone accesses the PlotlyShare URL</li>
        <li>Private plots are only accessible to you</li>
        <li>Public plots are accessible to anyone with the direct link</li>
        <li>We do not proactively access or retrieve your plots for any other purpose</li>
    </ul>


    <h2 id="data-sharing-and-third-parties">Data Sharing and Third Parties</h2>
    <p>We do not:</p>
    <ul>
        <li>Sell, rent, or trade your personal information</li>
        <li>Share your data with third parties for marketing purposes</li>
        <li>Use your data for advertising</li>
        <li>Provide access to your information to external parties</li>
    </ul>
    <p>The only data transfer occurs when:</p>
    <ul>
        <li>You choose to make a plot public and someone accesses it via the shared link</li>
        <li>You access your own plots through the Service</li>
    </ul>


    <h2 id="data-security">Data Security</h2>
    <p>We implement appropriate security measures to protect your information, including:</p>
    <ul>
        <li>Secure authentication through Google's OAuth system</li>
        <li>Encrypted data transmission</li>
        <li>Limited data collection practices</li>
        <li>Regular security assessments of our open-source codebase</li>
    </ul>


    <h2 id="your-rights-and-choices">Your Rights and Choices</h2>
    <p>You have the right to:</p>
    <ul>
        <li>Access the personal information we have about you</li>
        <li>Request deletion of your account and associated data</li>
        <li>Modify your plot visibility settings at any time</li>
        <li>Revoke access to your Google account through Google's security settings</li>
    </ul>
    <h3 id="account-deletion">Account Deletion</h3>
    <p>If you wish to delete your account:</p>
    <ol>
        <li>Contact us at 
            <a class="link link-secondary link-hover" href="mailto:8vlwiire1@mozmail.com"> 8vlwiire1@mozmail.com </a> 
        </li>
        <li>We will remove your profile information and plot metadata</li>
        <li>Your plot files will remain in your Google Drive (under your control)</li>
    </ol>


    <h2 id="open-source-commitment">Open Source Commitment</h2>
    <p>PlotlyShare is an open-source project. Our code is publicly available, allowing for:</p>
    <ul>
        <li>Transparency in how we handle your data</li>
        <li>Community review of our privacy practices</li>
        <li>Verification that we follow the practices outlined in this policy</li>
    </ul>


    <h2 id="no-advertising">No Advertising</h2>
    <p>
        We do not display advertisements or use your data for advertising purposes. PlotlyShare is provided as
        a free service without monetization through user data.
    </p>

    
    <h2 id="changes-to-this-privacy-policy">Changes to This Privacy Policy</h2>
    <p>We may update this Privacy Policy from time to time. When we do:</p>
    <ul>
        <li>We will post the updated policy on this page</li>
        <li>We will update the "Last Updated" date</li>
        <li>For significant changes, we may provide additional notice through the Service</li>
    </ul>
    
    
    <h2 id="data-retention">Data Retention</h2>
    <p>We retain your information only as long as necessary to provide the Service:</p>
    <ul>
        <li>Profile information: Until you delete your account</li>
        <li>Plot metadata: Until you delete specific plots or your account</li>
        <li>We do not retain data beyond what is necessary for Service functionality</li>
    </ul>


    <h2 id="international-users">International Users</h2>
    <p>
        By using PlotlyShare, you consent to the transfer of your information to our servers, which may be
        located in different countries than your own.
    </p>


    <h2 id="contact-us">Contact Us</h2>
    <p>If you have any questions about this Privacy Policy or our data practices, please contact us at:</p>
    <p>
        <strong>Email:</strong> 
        <a class="link link-secondary link-hover" href="mailto:8vlwiire1@mozmail.com"> 8vlwiire1@mozmail.com </a> 
        <br />
        <strong>Project Repository:</strong>
        <a class="link link-primary link-hover" href="https://github.com/plutonium-239/plotlyshare">github.com/plutonium-239/plotlyshare</a>
        <br />
        <strong>Website:</strong>
        <a class="link link-primary link-hover" href="https://plotlyshare.pages.dev">https://plotlyshare.pages.dev</a>
    </p>
    <h2 id="legal-basis-for-processing-gdpr-">Legal Basis for Processing (GDPR)</h2>
    <p>
        If you are in the European Union, our legal basis for processing your personal information includes:
    </p>
    <ul>
        <li><strong>Consent:</strong> You provide explicit consent when signing in with Google</li>
        <li><strong>Legitimate Interest:</strong> To provide and improve our Service</li>
        <li><strong>Contract Performance:</strong> To fulfill our obligations in providing the Service</li>
    </ul>
    <hr />
    <p>
        <em>
            This privacy policy is designed to be transparent about our minimal data collection practices. As
            an open-source project, our code and practices are available for public review and verification.
        </em>
    </p>
</div>
<!-- </div> -->

<style type="text/postcss">
    h1,
    h2,
    ul,
    ol {
        all: revert;
    }

    h1 {
        @apply text-primary;
    }
    h2 {
        @apply text-secondary;
    }
    h3 {
        @apply text-accent;
    }

    :global(.footer-about) {
        @apply sticky bottom-0;
    }
</style>
