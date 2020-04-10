const Command = require('../../classes/Command')
const client = require('../../components/client')

module.exports = new Command(async (msg, suffix) => {
  const chunks = suffix.split(' ')
  const ids = chunks
    .map(x => x.match(/([0-9]*)/)[1])
    .filter(x => x.length > 1 && x !== client.user.id)
  const members = [
    ...msg.mentions.filter(u => u.id !== client.user.id).map((user) => msg.channel.guild.members.get(user.id)),
    ...ids.map((user) => msg.channel.guild.members.get(user))
  ]
  if (members.length === 0) return msg.channel.createMessage('Please provide IDs or mention users you\'d like to ban')
  const reason = chunks.slice(members.length).join(' ').length === 0
    ? '[No reason provided]'
    : chunks.slice(members.length).join(' ')

  const reply = await msg.channel.createMessage('Working on it...')
  const result = await Promise.all(
    members
      .map(x => x.ban(7, `${msg.author.username}#${msg.author.discriminator}: ${reason}`))
      .map(p => p.catch(e => e))
  )

  await reply.edit(
    `Banned ${result.filter(x => !(x instanceof Error)).length} members` +
    ((result.filter(x => x instanceof Error).length > 0) ? `\nCouldn't ban ${result.filter(x => x instanceof Error).length} members` : '')
  )
}, {
  ownPermsNeeded: ['banMembers'],
  standardPrereqs: ['banMembers']
})
