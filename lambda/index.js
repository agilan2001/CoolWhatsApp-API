const WhatsAppWeb = require('baileys')
const fs = require('fs')
const client = new WhatsAppWeb();

const buffer = fs.readFileSync("jerry.png") // load some gif


var admin = require("firebase-admin");

var serviceAccount = {
    "type": "service_account",
    "project_id": "agilan-whatsapp-bot",
    "private_key_id": "5b2dae4de8a7eac5303754cbf4dda84fb6806ae2",
    "client_email": "firebase-adminsdk-rzlm2@agilan-whatsapp-bot.iam.gserviceaccount.com",
    "client_id": "101588737865853145325",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-rzlm2%40agilan-whatsapp-bot.iam.gserviceaccount.com"
  }
  

serviceAccount["private_key"] = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');



admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://agilan-whatsapp-bot.firebaseio.com"
});

var db = admin.database();

async function send_hi(numb) {
    /*
    var options = { caption: `\n_HELLO *FRIEND*_ 😉,\n\nWishing you a GREAT LIFE ahead...\n    💯💥🏁😎\n\nThank you for visiting *WhatsApp-AGILAN*\n    👍👍👍\n\n` }
    return client.sendMediaMessage(numb + "@s.whatsapp.net", buffer, "imageMessage", options);
*/

    var msg_cnt;
    await db.ref("cnt").transaction(function (cur_cnt) {
        msg_cnt = cur_cnt;
        return cur_cnt + 1;
    })
    db.ref("hist").push([(numb.slice(0, 6) + ("****") + numb.slice(10)), Date.now()]);

    var options = { caption: `\n_HELLO *FRIEND*_ 😉,\n\nWishing you a GREAT LIFE ahead...\n    💯💥🏁😎\n\nThank you for visiting *WhatsApp-AGILAN*\n    👍👍👍\n\nMessage No. : *${msg_cnt + 1}*\n\n` }
    return client.sendMediaMessage(numb + "@s.whatsapp.net", buffer, "imageMessage", options);
    
}

async function send_mess(num,cn) {

    if (!client.conn) {
        await client.connectSlim({
            "clientID": "j3JrU90xAwe8L/zlazQf8w==",
            "serverToken": "1@xt53LuTT+62J9Ac8nE16vOoD8DBxLE6Z+zutNOYcGcO3qN5j19YI2uQX2AnFL7l+znVMaLPZ6y8+pg==",
            "clientToken": "UdoNXveVr+ml+BS4FyCnoj9N4S8Ut7JH9xf49u4lynQ=",
            "encKey": "Sg2KKoxxW6sgarIddSRN/TBz9jLGa7g6L5lmVMPuxW4=",
            "macKey": "Vhap750h1kpgLF55Uqpz07eVm3Z1AQ7g6OE4kfhNzPE="
        }, 20000)
    }



    var full_num = cn + num;
    console.log(full_num);


    var end_mes;
    var snap = await db.ref("num/" + full_num).once("value");
    if (!snap.exists()) {
        db.ref("num/" + full_num).set(1);
        await send_hi(full_num);
        end_mes = "sent";
    } else {
        if (snap.val() < 5) {
            await send_hi(full_num);
            db.ref("num/" + full_num).set(snap.val() + 1);
            end_mes = "sent";
        } else {
            end_mes = "limit";
        }
    }

    client.close();


    return ({
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(end_mes),

    })




    //.catch(err => console.log("unexpected error: " + err))
}
exports.handler = async (event) => {

    var num = event.queryStringParameters.num;
    var cn = event.queryStringParameters.cn || "91";			

    if (num) {
        return (await send_mess(num,cn));
    }
}
