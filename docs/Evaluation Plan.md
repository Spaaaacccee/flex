![Bonfire](https://raw.githubusercontent.com/Spaaaacccee/flex/master/public/icons/favicon-32x32.png)

# 3 Stage Evaluation Plan

## Stage 1

### Time Frame

Prior to client signing off on the finished software

### Strategy

- User acceptance testing, with the client and others.

- Post-user-acceptance-testing survey.

- Evaluation by referring to the evaluation criteria in Part A.

### Criterion

#### Efficiency

- **Were the users able to use the software without guidance?**

  The majority of users have used older versions of the software prior to the user acceptance testing, though not extensively. The users were able to navigate and use the features of the software without guidance. Users reported that the similarities to existing software, e.g. Discord, helped with their usage of this new software.

  Successfulness rating: 5/5

- **Was the software fast and responsive during use?**

  The interface was highly responsive and fluid and did not show any signs of client-side lag.

  However, internet connection was slow to a degree where some operations, like real-time chat, seemed laggy to use. Sometimes, messages may take over half a minute to appear. This is a known issue, as the superior WebSocket API appears to be blocked by the school's internet connection, causing the app to fallback to using POST and GET requests, the same issue does not appear when the app is used anywhere else.

  Interfaces loaded under 1 second, animations helped in the feeling of fluidity and responsiveness, but generally did not detract from the experience. Software generally did not perform under 60fps. The software may perform better when the performance sampler is not running.

  Requests generally did not exceed 500KB.

  The above data was obtained using the Google Chrome Performance Sampling tools and Network Sampling tools.

  Successfulness rating: 4/5

- **Did the users find the software easy to understand and enjoyable to use?**

  Survey results indicated that overall, the software was easy, and enjoyable to use. On average, users rated the usability of the app 4.5/5.

  All text are clear and legible, colours and icons aid the experience. Users overall reported no issues, or very minimal issues in understanding the software.

  Successfulness rating: 4/5

#### Effectiveness

- **Does the software provide correct output to inputted data?**

  All tests that were than produced expected results. No errors were found.

  - The data displayed in the summary is 100% correct

  - The data displayed in the timeline is 100% correct

  - The messages displayed are 100% correct

  - The information about files are 100% correct

  - User and project details are always correct

  The user is notified events at the time that is set

  Successfulness rating: 5/5

- **Was the software able to help users in the planning process?**

  The software was able to help users manage a project timeline. It provided a platform for discussion, planning of events and when they should occur. In the survey, the participants rated "The app helped the project planning process" on average 4.5 out of 5.

  Successfulness rating: 4/5

- **Was the software able to help users understand their role and keep them on track in the project?**

  In general, the app was able to provide clarity to the user's goals, as an individual and as a team. The ability to tag events to users and roles helps members understand what they should be doing. Notifications and the feed page allow the user to make sure they're on track as a member of a project. Survey results show that the app performed the worst in this aspect, with a score of 4/5, and one user rating it 3/5. Although it was considered a pass, more can be done to improve the app in this aspect, see corrective action in [User Acceptance testing](User%20Acceptance%20Testing.md) for more information.

  Successfulness rating: 3/5

### Explanation

The client was given a mock project and associated tasks to complete with some other users. The client and users was able to complete all tasks successfully.

The client and other users were then given an online survey to feedback on their experience.

The criteria are above are based on the evaluation criteria in Part A. They are combined and added to for easier judgement.

See above for details.

## Stage 2

### Time Frame

Immediately after installation.

### Strategy

Interviews will be conducted with the client and users. Users in this case will feature more, and different people to stage 2 to get a better sense of the successfulness of the app.

The client and users will also be asked to complete the evaluation criteria form submitted in Part A, along with being asked the following questions.

### Criterion

#### Efficiency

- **Is the app running smoothly?**

  Is the app running at 60 fps at all times? Y/N

  Does the app transfer any more than 500KB when fetching for data? Y/N

  Does the pages load under 1 second? Y/N

  Successfulness rating: -/3

- **Is the app enjoyable and easy to use?**

  Does the user feel satisfied when using the app? Y/N

  Does the user feel highly about the visuals and animations of the app? Y/N

  Does the user have trouble interpreting or understanding what certain parts of the app does? Y/N

  Successfulness rating: -/3

#### Effectiveness

- **Is the software accessible and running without issues?**

  Was any errors logged in the browser console? Y/N

  Are all data that is produced 100% correct? Y/N

  Successfulness rating: -/2

- **Is the software helping your group projects run smoothly?**

  Has the discussion feature helped the team in assigning tasks and roles?

  Has the timeline feature helped the team in managing a project schedule?

  Has the file management feature helped the team in managing versions of files?

  Successfulness rating: -/3

- **Is there anything that could be done to improve the integration of the app?**

  Opened ended question demanding the user to give deeper insight into their use of the app.

  More suggestions of changes that could improve the app will lead to a lower successfulness rating.

  Successfulness rating: -/5

### Explanation

After the installation, it should be ensured that the software is installed correctly and integrated well into the usage environment. As the software has not had a chance yet of being used extensively, tests must be done assuming the user has not interacted with the software much.

The evaluation criteria from part A is based on a comprehensive set of functional and non-functional requirements as outlined in the SRS. It is designed to be efficient to use for both a developer or user to judge whether has met its requirements. For example, the evaluation criteria allows the evaluator to mark how successful an aspect was out of 5 stars.

## Stage 3

### Time Frame

5 months after installation.

### Strategy

An online survey or questionnaire will be distributed to users of the application on the usage of the app. The contents will contain the following questions as well as the contents from the evaluation criteria from Part A of the project.

### Criterion

#### Efficiency

- **Is the app running smoothly?**

  Is the app running at 60 fps at all times? Y/N

  Does the app transfer any more than 500KB when fetching for data? Y/N

  Does the pages load under 1 second? Y/N

  Successfulness rating: -/3

- **Is the app enjoyable and easy to use?**

  Does the user feel satisfied when using the app? Y/N

  Does the user feel highly about the visuals and animations of the app? Y/N

  Does the user have trouble interpreting or understanding what certain parts of the app does? Y/N

  Successfulness rating: -/3

#### Effectiveness

- **Is the software accessible and running without issues?**

  Was any errors logged in the browser console? Y/N

  Are all data that is produced 100% correct? Y/N

  Successfulness rating: -/2

- **Is the software helping your group projects run smoothly?**

  Has the discussion feature helped the team in assigning tasks and roles?

  Has the timeline feature helped the team in managing a project schedule?

  Has the file management feature helped the team in managing versions of files?

  Successfulness rating: -/3

- **Is there anything that could be done to improve the integration of the app?**

  Opened ended question demanding the user to give deeper insight into their use of the app.

  More suggestions of changes that could improve the app will lead to a lower successfulness rating.

  Successfulness rating: -/5

### Explanation

The same criteria will be used to evaluate the integration of the app after 5 months. This will ensure the results a directly comparable and help achieve a valid conclusion.

See the explanation above for more details.
