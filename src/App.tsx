import React from 'react';
import algosdk from 'algosdk';
import MyAlgoConnect from '@randlabs/myalgo-connect';
import buffer from 'buffer';
import { useForm } from 'react-hook-form';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import './App.css';
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "algorand-walletconnect-qrcode-modal";
import { formatJsonRpcRequest } from "@json-rpc-tools/utils";

type Profile = {
  receiverAddr: string
  amount: string
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(20),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '200%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    border: 0,
    borderRadius: 3,
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    color: 'white',
    height: 48,
    padding: '0 30px',
  },
}));


function App() {
  const { register, handleSubmit, formState: { errors } } = useForm<Profile>()
  const classes = useStyles();

  const onSubmit = handleSubmit(async (data) => {
    alert(JSON.stringify(data))
    const { Buffer } = buffer;
    if (!window.Buffer) window.Buffer = Buffer;



    const connector = new WalletConnect({
      bridge: "https://bridge.walletconnect.org", // Required
      qrcodeModal: QRCodeModal,
    });

    // Check if connection is already established
    if (!connector.connected) {
      // create new session
      connector.createSession();
    }

    // Subscribe to connection events
    connector.on("connect", (error, payload) => {
      if (error) {
        throw error;
      }

      // Get provided accounts
      const { accounts } = payload.params[0];
    });

    connector.on("session_update", (error, payload) => {
      if (error) {
        throw error;
      }

      // Get updated accounts 
      const { accounts } = payload.params[0];
    });

    connector.on("disconnect", (error, payload) => {
      if (error) {
        throw error;
      }
    });

    const algosdk = require('algosdk');
    const baseServer = 'https://testnet-algorand.api.purestake.io/ps2'
    const port = '';
    const token = {'X-API-Key': ''}

    const algodClient = new algosdk.Algodv2(token, baseServer, port);
  
    const suggestedParams = await algodClient.getTransactionParams().do();


    var amount = (parseInt(data.amount) * 1000000);
    var receiverAddr = data.receiverAddr;
    var note = undefined;


    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: "ENERB6J6SNGA5YF5NHBMBXUEQOOV5ZTX2Z2OZPSMI4MBVMAXIVUK7FE22E",
      to: "BY7GB4KF7GGUGJA2OOG742SEUEW3WFBS6QTEDIQI4QTMEDJNBMX77MS3XM",
      amount: 100000,
      suggestedParams,
    });

    const txns = [txn]
    const txnsToSign = txns.map(txn => {
    const encodedTxn = Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString("base64");

      return {
        txn: encodedTxn,
        message: 'Description of transaction being signed',
      };
    });

    const requestParams = [txnsToSign];

    const request = formatJsonRpcRequest("algo_signTxn", requestParams);
    const result: Array<string | null> = await connector.sendCustomRequest(request);
    const decodedResult = result.map(element => {
      return element ? new Uint8Array(Buffer.from(element, "base64")) : null;
    });

    console.log(decodedResult)

    connector.killSession();

  })

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Transfer Algo's Using MyAlgo Wallet
        </Typography>
        <form className={classes.form} onSubmit={onSubmit}>
          <div>
            <TextField {...register("receiverAddr", { required: true })} name="receiverAddr" margin="normal" label="Receiver Address" autoFocus variant="outlined" fullWidth type="text" />
            {
              errors.receiverAddr && <div className="error"> Enter Receiver Address</div>
            }
          </div>
          <div>
            <TextField {...register("amount", { required: true })} name="amount" label="Amount" margin="normal" variant="outlined" fullWidth type="text" />
            {
              errors.amount && <div className="error"> Enter amount </div>
            }
          </div>
          <Button className={classes.submit} color="primary" variant="contained" fullWidth type="submit">Submit Transaction</Button>
        </form>
      </div>
    </Container>

  );
}

export default App;