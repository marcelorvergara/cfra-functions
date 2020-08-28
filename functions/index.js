const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors')({origin: true});

admin.initializeApp(functions.config().firebase);

//backup automatio
const firestore = require('@google-cloud/firestore');
const client = new firestore.v1.FirestoreAdminClient();
const projid = 'fisioapp-9cfc0';
const bucket = 'gs://fisioapp/ExportedFiles/Auto';
var moment = require('moment');
var created = moment().format('DDMMYYYY');

exports.bupFirestoreAtuo = functions.pubsub
                                            .schedule('every 24 hours')
                                            .onRun((context) => {
  const databaseName =
    client.databasePath(projid, '(default)');

  return client.exportDocuments({
    name: databaseName,
    outputUriPrefix: bucket + created,
    collectionIds: ['agenda','agendamentos','agendanotok','agendaok','confirmacoes','entradas','evolucaodiaria','fornecedores','funcionarios','pacientes','pacotes','procedimentos','saidas','salas']
    })
  .then(responses => {
    const response = responses[0];
    console.log(`Operation Name: ${response['name']}`);
    return response;
  })
  .catch(err => {
    console.error(err);
    throw new Error('Export operation failed');
  });
});

const db = admin.firestore();

let id;
let answ;

exports.fisioApp = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Resposta armazenada com sucesso!");
	id=request.query.id;
	answ=request.query.answ;

	const docRef = db.collection('confirmacoes').doc(`${id}`);
	docRef.set({
		ident: `${id}`,
		answ: `${answ}`

	})
});

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'fisioapp.cfra@gmail.com',
        pass: '@efm(i3!sd9j'
    }
});

exports.sendMail = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
      
    // pegando os parametros
    const dest = req.query.dest;
	const code = req.query.oobCode;
	const chave = req.query.chave;
	const lang = req.query.lang;
	    
        const mailOptions = {
            from: 'CFRA <fisioapp.cfra@gmail.com>', 
            to: dest,
            subject: 'Reset de Senha', // email subject
            html: `<p style="font-size: 16px;">Reset sua Senha no Fisio App</p>
			
			<img width="200px" height="200px" title="Logo CFRA" alt="logo" src="https://scontent.fsdu8-2.fna.fbcdn.net/v/t1.0-9/36277468_2260590220624999_1685536786916311040_n.jpg?_nc_cat=100&_nc_sid=85a577&_nc_ohc=w-iPtsXNNWoAX9zcRGM&_nc_ht=scontent.fsdu8-2.fna&oh=5f51f501d97bdaa7fb82ffca0b150e67&oe=5F5004E5" />
			<div>Olá,<p>

			Esse email foi enviado para resetar a senha no aplicativo Fisio App referente ao login `+dest +`<p>

			<p>Clique aqui <a href="https://fisioapp-9cfc0.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=` + code + `&apiKey=` + chave + `&lang=`+ lang +`">nesse link</a> para resetar sua senha.</p>
			</p>
			Se não pediu para resetar a senha, favor ignorar esse e-mail.
			<p>
			Obrigado,<p>
			
			Time Fisio App
			</div>	
		`
        };
  
        // returning result
        return transporter.sendMail(mailOptions, (erro, info) => {
            if(erro){
                return res.send(erro.toString());
            }
            return res.send(`<p style="font-size: 16px;">Reset sua Senha no Fisio App</p>
			
			<img width="200px" height="200px" title="Logo CFRA" alt="logo" src="https://scontent.fsdu8-2.fna.fbcdn.net/v/t1.0-9/36277468_2260590220624999_1685536786916311040_n.jpg?_nc_cat=100&_nc_sid=85a577&_nc_ohc=w-iPtsXNNWoAX9zcRGM&_nc_ht=scontent.fsdu8-2.fna&oh=5f51f501d97bdaa7fb82ffca0b150e67&oe=5F5004E5" />
			<div>Olá,<p>

			Email enviado para `+ dest +` referente ao reset da senha no aplicativo Fisio App.<p>

			
			Time Fisio App
			</div>	`);
        });
    });    
});

exports.newFunc = functions.https.onRequest((req, res) => {
	res.status(200).send('<!DOCTYPE html> <html> <head> <meta name="google-site-verification" content="2SDT-AsjmfTDT0gMoUQBTs4nFTkQHjFOFlCdh8CfcxM" /> </head> <body> </body> </html>')
})
