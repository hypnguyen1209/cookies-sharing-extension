# cookies-sharing-extension

The toolkit includes source code with extension and a deploy storage server that contains secure cookies.

The main function is to access resources and permissions of the website without the need for a username and password or 2FA Authenticator.

*Features: (used like J2TEAM Cookies)*
- Import Cookies
- Export Cookies
- Set password to encrypt cookies securely
- Refesh website automatically after importing cookies.

*Additional:*
- Create quick cookie url for easy sharing with others.
- The cookie path will be deleted after 24 hours from the time the cookies were exported (set the time according to the developer wishes, by default it will be 24 hours).

Technology used:
- Extension: HTML, Bulma, Javascript
- Serve: NodeJS, Express, Firebase

*How to use:*

With the extension, we open developer mode in Chrome and Edge browser. The release version will be available soon on the Chorme webstore and Edge addon store.
With serve, we can use it directly through the side I provide running on a firebase database. Or you can deploy it yourself to have a longer usage time depending on your needs.

*How to install serve:*

To deploy a server, you first need to configure the firebase and the Base URL by editing the config.json file in the root directory.

```json
{
  "firebase": {
    "apiKey": "",
    "authDomain": "",
    "databaseURL": ""
  },
  "base_url": "test:5600"
}
```

To get the information of the firebase project, visit: https://console.firebase.google.com/project

Then proceed to install the node package for serve by running the command:
> npm i

Initialize serve with the command:
> npm start

Well done!
There is docker support if you want to run on containers. 💙
