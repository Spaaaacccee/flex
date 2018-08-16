# Validation & Algorithms

## Validation

There are various stages where the user is required to enter data.

> In general, the program aims to prevent invalid data, rather than reject invalid data and prompt the user to reenter once they have submitted. This is known to improve usability and user experience.

### 1 Creation of new projects

![Create Project](./img/img2.png)

#### 1.1 Project name

- Intrinsic properties of the input field is that it only allows text characters (except line breaking characters) to be entered.

- As the user types, the program continuously trims whitespace on the left side of the entered value.

- The program all surrounding whitespace around the project name when it is submitted.

- The program allows input of any length, as long as the above is satisfied.

- If the resulting value is empty, "Untitled Project" takes its place.

CreateProject.js

```javascript
onChange={e => {
  this.setState({
    projectName: $.string(e.target.value).trimLeft()
  });
}}
```

Main.js

```javascript
onSubmit={async data => {
  // Set a default name in case the entered project name is empty.
  data.projectName = data.projectName || "Untitled Project";
  ...unrelated code
```

#### 1.2 Project description

- Any text input is allowed.

#### 1.3 Invite people

- The user can only choose from a predetermined list of suggestions. All other input is ignored.

- The list of available users is fetched in real time from the database, therefore each option is guaranteed to be a user that exists.

![Suggestions](./img/img3.png)

### 2 Invite Users

![Invite Users](./img/img4.png)

This component functions exactly like 1.3 Invite People in Create project, submitting is not allowed if the field is empty:

```javascript
<Button
  disabled={!this.state.recipients.length}
  ...unrelated code
>
```

### 3 General Project Settings

![General Settings](./img/img5.png)

Both the Project name and Project description fields function the same way as in Create Project. See 1 Create Project for relevant code.

### Role Settings

![Role Settings](./img/img6.png)

Each role input field follows the same input restrictions as 1.1 Project name. See that section for relevant code. Instead of replacing empty fields with "Untitled Project", role input fields replace it with "New Role" upon defocus. The user can immediately realise that empty fields are not allowed and can enter a valid value before submission.

```javascript
<Input
  // Trim whitespace on the left or reset the field to "New Role" to ensure the field always contains a valid value.
  onBlur={e => {
    this.setState(
      update(this.state, {
        values: {
          [index]: {
            name: { $set: e.target.value.trim() || "New Role" }
          }
        }
      }),
      () => {
        // Inform the parent component of this change.
        this.props.onChange(this.state.values);
      }
    );
  }}
  ...unrelated code
>
```

## Complex Algorithm

[Asynchronous quicksort](../src/classes/Algorithm.js)
