![Bonfire](https://raw.githubusercontent.com/Spaaaacccee/flex/master/public/icons/favicon-32x32.png)

# Tests

## Test environment

Desktop: Chrome 67.0 / Windows 10 / Dell Latitude 3379

Mobile: Mobile Safari / iOS 9.3.2 / iPhone 5S

All tests are verified in both environments

## Important Notes

Variables and data structures used below are for demonstrative purposes only, and does not exactly match the source code - sometimes data irrelevant to a specific test in objects are omitted - to ensure clarity and understandability - but represents the original code to the greatest extent.

Some basic Javascript syntax that will ensure the following tests are clear to read:

| Notation | Description                                              |
| -------- | -------------------------------------------------------- |
| `{}`     | Empty object                                             |
| `[]`     | Empty array                                              |
| `""`     | Empty string                                             |
| `null`   | Any value that equals null, including null and undefined |

UI Elements have built-in input validation or intrinsic restrictions that prevent invalid data from being entered. The following will not be tested individually as it has been verified that it is impossible to enter invalid data of this kind:

| Type                 | Native Input Restrictions                                                                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text field           | Allow any UTF-8 Character, except characters that require a new line (line break, carriage return etc.). new line characters will be converted to a space (" "). |
| Multiline text field | Allow any UTF Character.                                                                                                                                         |
| Date picker          | Follows the same restrictions as text field. Disallows any input that does not match the format yyyy-mm-dd.                                                      |
| File Open dialog     | Allow any file. Selection of folders or multiple files is disallowed.                                                                                            |
|                      |

## 0 General

> The Sign In functionality is provided by the Google OAuth API. When a user is signed in, data set in the browser's cookies and local storage, which can be used by this app to authenticate and identify a user.

> Note: In the latest version, the sign in mechanic changed, and no longer determines the sign in state using cookies and webstorage. Instead, the app watches the Firebase UI on animation frames. to make decisions on what to display.

| ID  | Element | Data                                                                           | Expected                                                           | Actual                                         | Fix |
| --- | ------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ---------------------------------------------- | --- |
| 0.1 | Sign In | App loaded, no Google authentication data in cookies & web storage             | Do nothing                                                         | As expected                                    | -   |
| 0.2 | Sign In | Sign In button pressed, no Google authentication data in cookies & web storage | signIn.buttonState=loading, redirect to Google sign in             | As expected                                    | -   |
| 0.3 | Sign In | App loaded, Google authentication data in cookies & web storage                | signIn.buttonState=loading, Sign in visible=false, user page shown | As expected                                    | -   |
| 0.4 | Sign In | Firebase UI is loading.                                                        | `signIn.btnState = loading`                                        | As expected                                    | -   |
| 0.5 | Sign In | Firebase UI is ready.                                                          | `signIn.btnState = ready`                                          | As expected ![Sign In Loading](./img/img9.png) | -   |
| 0.6 | Sign In | Firebase UI is ready. Sign in button pressed.                                  | Start sign in, `signIn.buttonState = loading`                      | As expected ![Sign In Ready](./img/img10.png)  | -   |
| 0.6 | Sign In | Firebase UI is loading. Sign in button pressed.                                | Do nothing                                                         | As expected                                    | -   |

## 1 Layout

| ID  | Element | Data                | Expected                                             | Actual                                               | Fix |
| --- | ------- | ------------------- | ---------------------------------------------------- | ---------------------------------------------------- | --- |
| 1.1 | Main    | `Window width=1599` | Sidebars collapsed, expand navigation button visible | As expected ![Main Sider Collapsed](./img/img11.png) | -   |
| 1.2 | Main    | `Window width=1600` | Sidebars expanded, expand navigation button hidden   | As expected ![Main Sider Open](./img/img12.png)      | -   |

## 2 Navigation

| ID  | Element                              | Data                                           | Expected                                                       | Actual                                      | Fix |
| --- | ------------------------------------ | ---------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------- | --- |
| 2.1 | Project sidebar & In-project sidebar | Expand navigation selected, sidebars collapsed | Sidebars expanded                                              | As expected ![Siders Open](./img/img13.png) | -   |
| 2.2 | Project sidebar & In-project sidebar | Expand navigation selected, Sidebars expanded  | Sidebars collapsed                                             | As expected                                 | -   |
| 2.3 | Project sidebar                      | User icon selected                             | User icon highlighted, content switches to user page           | As expected                                 | -   |
| 2.4 | Project sidebar                      | Project icon selected                          | Project icon highlighted, content switches to selected project | As expected                                 | -   |
| 2.5 | In-project sidebar                   | Page item selected                             | Page item highlighted, content switches to selected page       | As expected                                 | -   |

## 3 High-level components

| ID   | Element                   | Data                                                                 | Expected                                                   | Actual                                                | Fix                                                                                                        |
| ---- | ------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 3.1  | Project name label        | `project=null`                                                       | show loading icon                                          | As expected                                           | -                                                                                                          |
| 3.2  | Project name label        | `project.name=null`                                                  | show loading icon                                          | As expected ![Project Title Loading](./img/img16.png) | -                                                                                                          |
| 3.3  | Project name label        | `project.name=""`                                                    | show "Untitled Project"                                    | loading icon shown                                    | Prevent project name from becoming an empty string by reverting to "Untitled Project" when a change occurs |
| 3.4  | Project name label        | `project.name="Example Title"`                                       | show "Example Title"                                       | As expected                                           | -                                                                                                          |
| 3.5  | Project name label        | `project.name="Really really long title that goes on forever"`       | show truncated title e.g. "A really long name th..."       | As expected ![Project Title](./img/img15.png)         | -                                                                                                          |
| 3.6  | Project description label | `project=null`                                                       | show nothing                                               | As expected                                           | -                                                                                                          |
| 3.7  | Project description label | `project.description=null`                                           | show nothing                                               | As expected                                           | -                                                                                                          |
| 3.8  | Project description label | `project.description=""`                                             | show nothing                                               | As expected                                           | -                                                                                                          |
| 3.9  | Project description label | `project.description="Example Description"`                          | show "Example Description"                                 | As expected                                           | -                                                                                                          |
| 3.10 | Project description label | `project.name="Really really long description that goes on forever"` | show truncated description e.g. "A really long descrip..." | As expected ![Project Description](./img/img14.png)   | -                                                                                                          |
| 3.11 | Project description label | `project.description!=null`, mouse hover                             | show tooltip of project.description                        | As expected (See above for screenshot)                | -                                                                                                          |
| 3.12 | Project description label | `project.description=null`, mouse hover                              | do nothing                                                 | As expected                                           | -                                                                                                          |
| 3.13 | Invite users button       | button pressed                                                       | display invite users modal                                 | As expected                                           | -                                                                                                          |

## 4 Pages

> Pages are displayed by the PageView component, which supplies each page with Project and User information, along with other functionalities.
> The user page is an exception and does not expect Project information to be supplied to it.

### 4.1 User Page

| ID    | Element | Data        | Expected                      | Actual                                  | Fix |
| ----- | ------- | ----------- | ----------------------------- | --------------------------------------- | --- |
| 4.1.1 | Page    | user = null | Display loading icon and text | As expected ![Loading](./img/img17.png) | -   |

## 5 Forms & Panels

### 5.1 Invite Users Panel

> The User Picker is a component that directly searches and returns registered users from the database based on their email using a search string.
> The component restricts user input to be plain text with no line breaks.

| ID    | Element             | Data                                                                                                   | Expected                                                              | Actual                                                      | Fix |
| ----- | ------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- | ----------------------------------------------------------- | --- |
| 5.1.1 | User picker         | `input=""`                                                                                             | do nothing                                                            | As expected                                                 | -   |
| 5.1.2 | User picker         | `input="x"`, `database.users=["x@e.com","y@e.com"]`                                                    | suggest "x@e.com"                                                     | As expected                                                 | -   |
| 5.1.3 | User picker         | `input="x"`, `database.users=["x1@e.com","x2@e.com","y@e.com"]`                                        | suggest `["x1@e.com","x2@e.com"]`                                     | As expected ![Select User](./img/img18.png)                 | -   |
| 5.1.4 | User picker         | `input="x"` , `database.users=["x1@e.com","2x@e.com","y@x.com"]`                                       | suggest `"x1@e.com"`                                                  | As expected                                                 | -   |
| 5.1.5 | User picker         | `suggestedUsers=["x1@e.com"]`, pressed `"x1@e.com"`, `selectedUsers=[]`                                | `selectedUsers=["x1@e.com"]`                                          | As expected                                                 | -   |
| 5.1.6 | User picker         | `suggestedUsers=["x1@e.com","2x@e.com","y@x.com"]`, pressed `"x1@e.com"`, `selectedUsers=["2x@e.com"]` | `selectedUsers=["2x@e.com", "x1@e.com"]`                              | As expected                                                 | -   |
| 5.1.7 | Invite Users Button | `selectedUsers=[]`                                                                                     | disable button                                                        | As expected ![Select User Button Disabled](./img/img20.png) | -   |
| 5.1.8 | Invite Users Button | `selectedUsers=["x@e.com"]`                                                                            | enable button                                                         | As expected ![Select User Button Enabled](./img/img19.png)  | -   |
| 5.1.9 | Invite Users Button | `selectedUsers=["x@e.com","2x@e.com","y@x.com"]`                                                       | request add users for `["x@e.com","2x@e.com","y@x.com"]`, close panel | As expected                                                 | -   |

## 6 Data & Fetching

> Tests for adding and setting data to users and projects are avaible in Section 7

| ID  | Element         | Data                                               | Expected      | Actual      | Fix |
| --- | --------------- | -------------------------------------------------- | ------------- | ----------- | --- |
| 6.1 | User Fetcher    | `userID=null`                                      | return `null` | As expected | -   |
| 6.2 | User Fetcher    | `userID="x"`, `database.users=["x","y","z"]`       | return `"x"`  | As expected | -   |
| 6.3 | User Fetcher    | `userID="x"`, `database.users=["a","b","c"]`       | return `null` | As expected | -   |
| 6.4 | Project Fetcher | `projectID=null`                                   | return `null` | As expected | -   |
| 6.5 | Project Fetcher | `projectID="x"`, `database.projects=["x","y","z"]` | return `"x"`  | As expected | -   |
| 6.6 | Project Fetcher | `projectID="x"`, `database.projects=["a","b","c"]` | return `null` | As expected | -   |

## 7 Core Objects

### 7.1 Project

| ID    | Element   | Data                                                                                       | Expected                                                                                               | Actual      | Fix |
| ----- | --------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ----------- | --- |
| 7.1.1 | Add event | input data: `{name:"a", description:"b","date":1533866631775,notify:1,autoComplete:false}` | Event created with data `{name:"a", description:"b","date":1533866631775,notify:1,autoComplete:false}` | As expected | -   |
| 7.1.1 | Add event | `{}`                                                                                       | Event created with data `{name:"a", description:"b","date":1533866631775}`                             | As expected | -   |

### 7.2 User

| ID | Element | Data | Expected | Actual | Fix |
| 7.2.1 | New Project | input data: `{name:null, description: null, invitePeople: null}` | project created with `{name: "Untitled Project": description: null, members: []}`

## 8 Utilities

| ID  | Element | Data | Expected | Actual | Fix |
| --- | ------- | ---- | -------- | ------ | --- |

