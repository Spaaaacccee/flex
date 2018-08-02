# Tests

## Test environment

Desktop: Chrome 67.0 / Windows 10 / Dell Latitude 3379

Mobile: Mobile Safari / iOS 9.3.2 / iPhone 5S

All tests are verified in both environments

## Important Notes

> Variables and data structures used below are for demonstrative purposes only, and does not exactly match the source code, to ensure clarity and understandability.

## 0 General

| ID  | Element | Data                                                                           | Expected                                                           | Actual      | Fix |
| --- | ------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ----------- | --- |
| 0.1 | Sign In | App loaded, no Google authentication data in cookies & web storage             | Do nothing                                                         | As expected | -   |
| 0.2 | Sign In | Sign In button pressed, no Google authentication data in cookies & web storage | signIn.buttonState=loading, redirect to Google sign in             | As expected | -   |
| 0.3 | Sign In | App loaded, Google authentication data in cookies & web storage                | signIn.buttonState=loading, Sign in visible=false, user page shown | As expected | -   |

## 1 Layout

| ID  | Element | Data                | Expected                                             | Actual      | Fix |
| --- | ------- | ------------------- | ---------------------------------------------------- | ----------- | --- |
| 1.1 | Main    | Window width = 1023 | Sidebars collapsed, expand navigation button visible | As expected | -   |
| 1.2 | Main    | Window width = 1024 | Sidebars expanded, expand navigation button hidden   | As expected | -   |
| 1.3 | Main    | Window width = 1025 | Sidebars expanded, expand navigation button hidden   | As expected | -   |

## 2 Navigation

| ID  | Element                              | Data                                           | Expected                                                       | Actual      | Fix |
| --- | ------------------------------------ | ---------------------------------------------- | -------------------------------------------------------------- | ----------- | --- |
| 2.1 | Project sidebar & In-project sidebar | Expand navigation selected, sidebars collapsed | Sidebars expanded                                              | As expected | -   |
| 2.2 | Project sidebar & In-project sidebar | Expand navigation selected, Sidebars collapsed | Sidebars expanded                                              | As expected | -   |
| 2.3 | Project sidebar                      | User icon selected                             | User icon highlighted, content switches to user page           | As expected | -   |
| 2.4 | Project sidebar                      | Project icon selected                          | Project icon highlighted, content switches to selected project | As expected | -   |
| 2.5 | In-project sidebar                   | Page item selected                             | Page item highlighted, content switches to selected page       | As expected | -   |

## 3 High-level components

| ID   | Element                   | Data                                                               | Expected                                                   | Actual             | Fix                                                                                                        |
| ---- | ------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------- |
| 3.1  | Project name label        | project=null                                                       | show loading icon                                          | As expected        | -                                                                                                          |
| 3.2  | Project name label        | project.name=null                                                  | show loading icon                                          | As expected        | -                                                                                                          |
| 3.3  | Project name label        | project.name=""                                                    | show "Untitled Project"                                    | loading icon shown | Prevent project name from becoming an empty string by reverting to "Untitled Project" when a change occurs |
| 3.4  | Project name label        | project.name="Example Title"                                       | show "Example Title"                                       | As expected        | -                                                                                                          |
| 3.5  | Project name label        | project.name="Really really long title that goes on forever"       | show truncated title e.g. "A really long name th..."       | As expected        | -                                                                                                          |
| 3.6  | Project description label | project=null                                                       | show nothing                                               | As expected        | -                                                                                                          |
| 3.7  | Project description label | project.description=null                                           | show nothing                                               | As expected        | -                                                                                                          |
| 3.8  | Project description label | project.description=""                                             | show nothing                                               | As expected        | -                                                                                                          |
| 3.9  | Project description label | project.description="Example Description"                          | show "Example Description"                                 | As expected        | -                                                                                                          |
| 3.10 | Project description label | project.name="Really really long description that goes on forever" | show truncated description e.g. "A really long descrip..." | As expected        | -                                                                                                          |
| 3.11 | Project description label | project.description!=null, mouse hover                             | show tooltip of project.description                        | As expected        | -                                                                                                          |
| 3.12 | Project description label | project.description=null, mouse hover                              | do nothing                                                 | As expected        | -                                                                                                          |
| 3.13 | Invite users button       | button pressed                                                     | display invite users modal                                 | As expected        | -                                                                                                          |

## 4 Pages

> Pages are displayed by the PageView component, which supplies each page with Project and User information, along with other functionalities.

> The user page is an exception and does not expect Project information to be supplied to it.

### 4.1 User Page

| ID    | Element | Data | Expected | Actual | Fix |
| ----- | ------- | ---- | -------- | ------ | --- |
| 4.1.1 |Page

## 5 Forms & Panels

### 5.1 Invite Users Panel

> The User Picker is a component that directly searches and returns registered users from the database based on their email using a search string.
> The component restricts user input to be plain text with no line breaks.

| ID    | Element             | Data                                                                                             | Expected                                                            | Actual      | Fix |
| ----- | ------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | ----------- | --- |
| 5.1.1 | User picker         | input=""                                                                                         | do nothing                                                          | As expected | -   |
| 5.1.2 | User picker         | input="x", database.users=["x@e.com","y@e.com"]                                                  | suggest "x@e.com"                                                   | As expected | -   |
| 5.1.3 | User picker         | input="x", database.users=["x1@e.com","x2@e.com","y@e.com"]                                      | suggest ["x1@e.com","x2@e.com"]                                     | As expected | -   |
| 5.1.4 | User picker         | input="x" , database.users=["x1@e.com","2x@e.com","y@x.com"]                                     | suggest "x1@e.com"                                                  | As expected | -   |
| 5.1.5 | User picker         | suggestedUsers=["x1@e.com"], pressed "x1@e.com", selectedUsers=[]                                | selectedUsers=["x1@e.com"]                                          | As expected | -   |
| 5.1.6 | User picker         | suggestedUsers=["x1@e.com","2x@e.com","y@x.com"], pressed "x1@e.com", selectedUsers=["2x@e.com"] | selectedUsers=["2x@e.com", "x1@e.com"]                              | As expected | -   |
| 5.1.7 | Invite Users Button | selectedUsers=[]                                                                                 | disable button                                                      | As expected | -   |
| 5.1.8 | Invite Users Button | selectedUsers=["x@e.com"]                                                                        | enable button                                                       | As expected | -   |
| 5.1.9 | Invite Users Button | selectedUsers=["x@e.com","2x@e.com","y@x.com"]                                                   | request add users for ["x@e.com","2x@e.com","y@x.com"], close panel | As expected | -   |

## 6 Data & Fetching

| ID    | Element | Data | Expected | Actual | Fix |
| ----- | ------- | ---- | -------- | ------ | --- |

## 7 Core Objects

| ID    | Element | Data | Expected | Actual | Fix |
| ----- | ------- | ---- | -------- | ------ | --- |

## 8 Utilities

| ID    | Element | Data | Expected | Actual | Fix |
| ----- | ------- | ---- | -------- | ------ | --- |