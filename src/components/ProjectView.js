import React, { useState } from "react";

import { Layout, Icon, message, Popover, Card } from "antd";
import { Scrollbars } from "react-custom-scrollbars";
import ProjectSider from "./ProjectSider";
import PageView from "./PageView";
import Page, { Pages, SpecialPages, NotFoundPage } from "../classes/Page";
import { NavigationData } from "./ProjectNavigation";
import $ from "../classes/Utils";

import "./ProjectView.css";
import Settings from "./Settings";
import SendInvite from "./SendInvite";
import MESSAGES from "../pages/Messages";

import { UserContext, ProjectContext } from "./Main";

const { Sider } = Layout;

const defaultProps = {
  mainSiderWidth: 64,
  siderWidth: 200,
  onNavButtonPress: () => {}, // A callback for when the expand/collapse navigation button is pressed
  onContentPress: () => {}, // A callback for when the main content area is pressed
  onNavDrag: () => {}, // A callback for when an open navigation gesture is performed
  navigationCollapsed: true,
  style: {},
  onMessage: () => {}
};

/**
 * Gets the pages that should be displayed
 * @static
 * @param  {NavigationData} navigation
 * @return {Page[]}
 * @memberof NavigationData
 */
export const getPages = navigation => {
  switch (navigation.type) {
    case "project":
      return Pages;
    case "special":
      return [
        SpecialPages.find(page => page.name === navigation.name) || NotFoundPage
      ];
    default:
      return [NotFoundPage];
  }
};

export default function ProjectView(props) {
  const allProps = { ...defaultProps, ...props };
  const {
    siderWidth,
    onNavButtonPress,
    onContentPress,
    style,
    onMessage,
    navigation,
    onProjectViewContentRef
  } = allProps;

  const project = ProjectContext.use(this);
  const user = UserContext.use(this);

  const allPages = getPages(navigation);
  const [i, setOpenedPageIndex] = useState(0);
  const [j, setPageLoadHandler] = useState(() => {});
  const [settingsVis, setSettingsVis] = useState(false);
  const [inviteVis, setInviteVis] = useState(false);
  const openedIndex = Math.min(i, allPages.length - 1);
  const pageLoadHandler = j || (() => {});
  const hasPermission =
    $.object(project).isUndefinedOrEmpty() || project.hasPermission(user.uid);

  return (
    <div
      className={allPages[openedIndex].name}
      style={{
        flex: 1,
        height: "100%",
        pointerEvents: "all",
        ...(project.deleted || !hasPermission ? { cursor: "not-allowed" } : {})
      }}
    >
      <Layout
        className="project-view-wrapper"
        style={{
          ...style,
          ...(project.deleted || !hasPermission
            ? { pointerEvents: "none", opacity: 0 }
            : {})
        }}
      >
        <Sider
          className="project-view-sider"
          width={siderWidth}
          style={{ display: allPages.length - 1 ? "block" : "none" }}
        >
          <div style={{ textAlign: "left", padding: "18px 22px" }}>
            <b
              style={{
                textOverflow: "ellipsis",
                overflow: "hidden",
                width: "100%",
                display: "block"
              }}
            >
              {project.name}
            </b>
            {!!project.description && (
              <Popover placement="bottomLeft" content={project.description}>
                <p
                  style={{
                    opacity: 0.65,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginTop: 5,
                    marginBottom: 0
                  }}
                >
                  {project.description}
                </p>
              </Popover>
            )}
          </div>
          <ProjectSider
            project={project}
            user={user}
            items={allPages}
            index={openedIndex}
            onItemSelected={args => {
              setOpenedPageIndex(args.index);
            }}
            onSettingsPress={() => {
              setSettingsVis(true);
            }}
            onInviteUsersPress={() => {
              setInviteVis(true);
            }}
          />
        </Sider>
        <div
          className="project-view-content-animation-container"
          ref={e => {
            onProjectViewContentRef(e);
          }}
          style={{
            transition: "none !important"
          }}
        >
          <Layout className="project-view-content">
            <div className="project-view-inner-content">
              <Scrollbars autoHide hideTracksWhenNotNeeded>
                <PageView
                  onLeftButtonPress={onNavButtonPress}
                  onContentPress={onContentPress}
                  project={project}
                  page={allPages[openedIndex]}
                  onPageLoad={pageLoadHandler}
                  onMessage={(msg => {
                    switch (msg.type) {
                      case "prepare-message":
                        // If the page asks to prepare a message, switch the page to the messages page.
                        setOpenedPageIndex(3);
                        setPageLoadHandler(messagesPage => {
                          // Send the prepared message once messages loads.
                          if (messagesPage instanceof MESSAGES)
                            messagesPage.handleSendRaw(msg.content);
                          setPageLoadHandler(() => {});
                        });
                        break;
                      case "navigate":
                        // If the page asks to switch the page, change the index to the specified page.
                        setOpenedPageIndex(msg.content);
                        break;
                      default:
                        // Otherwise, pass the message to the parent component.
                        onMessage(msg);
                        break;
                    }
                  }).bind(this)}
                ></PageView>
              </Scrollbars>
            </div>
          </Layout>
        </div>
      </Layout>
      <Settings
        user={user}
        project={project}
        visible={settingsVis}
        onClose={() => {
          setSettingsVis(false);
        }}
        onSave={values => {
          const tasks = [
            new Promise(res => {
              project.name !== values.general.name
                ? project.setName(values.general.name).then(() => res())
                : res();
            }),
            new Promise(res => {
              project.description !== values.general.description
                ? project.setName(values.general.name).then(() => res())
                : res();
            }),
            new Promise(res => {
              JSON.stringify(values.roles || []) !==
              JSON.stringify(project.roles || [])
                ? project.setRoles(values.roles).then(() => res())
                : res();
            })
          ];
          Promise.all(tasks).then(() => {
            setSettingsVis(false);
            message.success("Your changes were saved.");
          });
        }}
      />
      {/* The Send Invite window */}
      <SendInvite
        project={project}
        visible={inviteVis}
        onClose={() => {
          setInviteVis(false);
        }}
        onSend={() => {
          setInviteVis(false);
        }}
      />
      <Card
        style={{
          position: "fixed",
          top: 20,
          left: " 50%",
          transform: "translateX(-50%)",
          maxWidth: 300,
          display: !hasPermission ? "block" : "none"
        }}
      >
        <Icon
          type="close-circle"
          style={{ color: "#FF4D4F", fontSize: 24, marginBottom: 10 }}
        />
        <br />
        {`You don't have permission to make changes to ${project.name}. Ask the owner to invite you.`}
      </Card>
    </div>
  );
}
