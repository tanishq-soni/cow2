import { SlackCommandMiddlewareArgs } from "@slack/bolt"
import Channel from './models/Channel'

export async function allowCowCommand({ ack, say, command }: SlackCommandMiddlewareArgs) {
  if (!command.channel_id.startsWith('C')) { // private starts with G
    ack({
      text: "I don't want to join this private channel. Perhaps try in a public channel?",
    })
    return
  }

  await Channel.updateOne(
    { channelId: command.channel_id },
    { $set: { 
      channelId: command.channel_id,
      cowAllowed: true
    }},
    { upsert: true }
  )

  await ack({
    response_type: "in_channel",
    text: "MOO!!! This is a nice channel! You can now mention me (`@cow <your message>`) to summon me and start a COW-nversation! :cow2: \n_Type `/leave-cow` to block me from speaking in this channel_",
  })
}

export async function blockCowCommand({ ack, say, command }: SlackCommandMiddlewareArgs) {
  await Channel.updateOne(
    { channelId: command.channel_id },
    { $set: { 
      channelId: command.channel_id,
      cowAllowed: false
    }},
    { upsert: true }
  )

  await ack({
    response_type: "in_channel",
    text: `Bye! I'm sad that you don't want me :frowning: but I hope you'll visit me at <#${process.env.COW_HOME_CHANNEL}>. \n_Type \`/allow-cow\` to let me speak in this channel_`,
  })
}

export async function cowInfoCommand({ ack }: SlackCommandMiddlewareArgs) {
  ack({
    text: `Hey! I'm the Hack Club Cow 2.0 :cow2:. I am a <https://github.com/hackclub/cow2|friendly cow AI> powered by GPT-3's curie engine. I'm here to have fun and hang out. You can visit my home at <#${process.env.COW_HOME_CHANNEL}>!\n\nYou can start a conversation with me in any allowed channel by just @mentioning me with any question (this will summon me into your channel and away from any other channel I'm currently visiting) You can respond to me in a thread and I'll hopefully remember the context of our conversation. To allow me to visit your channel, type \`/allow-cow\`.\n\nGPT-3 tokens aren't free, so I do have a daily word limit. The word count grows cumulatively within each conversation (thread) as the entire conversation is sent to the API with each interaction. So, if you want to change topics please start a new thread. \n\nAlso, remember that I'm powered by an experimental AI trained on data from the internet, so no one can claim responsibility for what I say. If I ever accidentally say something highly inappropriate or offensive you can react with :x: to vote to remove it.\n\nPlease be nice, and don't try to spam or abuse me. Also please don't be selfish and use up my daily quota all by youself. If you do, my creator will have add per-user limits :(. Remember that all conversations are logged.\n\nI can't wait to talk to you about cows and hacking! :cow:`
  })
}