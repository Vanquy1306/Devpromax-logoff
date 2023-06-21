import Slack from "../models/Slack.js";
import { WebClient }from '@slack/web-api'
import dotenv from "dotenv";

dotenv.config();

let web = new WebClient(process.env.TOKEN_BOT);
const channelHR = "C054Z6ASE4E"
const channelDayoff = "C054JUNGDF1"
export const getAllChannel = async (req, res) => {
  try {
    const information = await Slack.find().sort([["createdAt", -1]]);
    res.json({ success: true, information });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const addNotification = async (req, res) => {
  try {
    const { day_off_channel = [], hr_channel = [], by_email } = req.body;
    const newNotification = new Slack({
      day_off_channel,
      hr_channel,
      by_email,
    });
    await newNotification.save();
    res.json({
      success: true,
      message: "Create complete !",
      data: newNotification,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const editNotification = async (req, res) => {
  try {
    const { day_off_channel = [], hr_channel = [], by_email } = req.body;
    // Simple validation

    let updateNotification = {
      day_off_channel,
      hr_channel,
      by_email,
    };
    const updateNotificationCondition = { _id: req.params.id };
    updateNotification = await Slack.findByIdAndUpdate(
      updateNotificationCondition,
      updateNotification,
      { new: true }
    );
    if (!updateNotification)
      return res.status(404).json({
        success: false,
      });
    else {
      res.json({
        success: true,
        message: "Excellent progress!",
        data: updateNotification,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const sendSlackHr = async (req, res) => {
  try {
    await web.chat.postMessage({
      channel: channelHR,
      text:'',
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "New request",
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Type:*\n${req.body.day_off_type}`,
            },
            {
              type: "mrkdwn",
              text: `*Created by:*\n ${req.body.user_name}`,
            },
          ],
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*When:*\n${req.body.start_date} - ${req.body.end_date}`,
            },
          ],
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: true,
                text: "Approve",
              },
              style: "primary",
              value: "click_me_123",
              url: "https://log-off-management.netlify.app/",
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: true,
                text: "Reject",
              },
              style: "danger",
              value: "click_me_123",
            },
          ],
        },
      ],
    });
    res.json({
      success: true,
      message: "Send complete !",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export const sendSlackDayoff = async (req, res) => {
  try {
    await web.chat.postMessage({
      channel: channelDayoff,
      text:'',
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "New request",
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Type:*\n${req.body.day_off_type}`,
            },
            {
              type: "mrkdwn",
              text: `*Created by:*\n ${req.body.user_name}`,
            },
          ],
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*When:*\n${req.body.start_date} - ${req.body.end_date}`,
            },
          ],
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: true,
                text: "Approve",
              },
              style: "primary",
              value: "click_me_123",
              url: "https://log-off-management.netlify.app/",
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: true,
                text: "Reject",
              },
              style: "danger",
              value: "click_me_123",
            },
          ],
        },
      ],
    });
    res.json({
      success: true,
      message: "Send complete !",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}