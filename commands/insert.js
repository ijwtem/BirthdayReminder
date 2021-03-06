const { Client, Message } = require("discord.js");
const birthday = require("../DBcollection/birthday")
const moment = require("moment-timezone")

module.exports = {
    name: 'insert',
    description: 'take input birthday date from user',
    permission: {
        user: [],
        bot: []
    },
    min_args: 0,
    args: [],
    aliases: ["input", "i"],
    /**
     * @param {Client} bot 
     * @param {Message} message 
     */
     run: async(bot, message) => {
        var answer = []
        const filter = (m) => { //Membuat filter agar orang yang request yang bisa menjawab pertanyaan dari bot
            return message.author.id == m.author.id
        }
        const q1 = await message.channel.send("Ulang tahun siapa yang anda input? (Tag user)")
        // Take user_id input
        const collector = message.channel.createMessageCollector({
            filter, 
            max:2,
            time: 20_000 //Limit time exceeded kalau tidak menjawab lebih dari satu menit
        })
        collector.on("collect", async(m)=>{
            answer.push(m.content)
            if (answer.length == 1) {
                message.channel.send("Kapan dia berulang tahun? (Input dengan format DD-MM-YYYY)")
            }
            if (answer.length == 2) {
                collector.stop("selesai")
            }
        })
        collector.on("end", async (m, reason)=>{ //Kalau udah lebih dari 1 menit tidak menjawab mka do
            if (reason == "selesai") {
                date_temp = moment(answer[1], "DD-MM-YYYY").tz('Asia/Jakarta').toISOString()
                // console.log(date_temp)
                if (!moment(answer[1], "DD-MM-YYYY").isValid()) {
                    return message.channel.send("Input tidak sesuai dengan format yang diminta")
                }
                message.channel.send("Berhasil!")
                await birthday.findOneAndUpdate({user_id: answer[0].replace(/[\\<>@!]/g, "")}, {
                    user_id: answer[0].replace(/[\\<>@!]/g, ""),
                    bday: moment(answer[1], "DD-MM-YYYY").tz('Asia/Jakarta').toISOString()
                }, {upsert: true})
            }
            else {
                message.channel.send("Kesempatan anda untuk menjawab telah habis")
            }
        })

}
};