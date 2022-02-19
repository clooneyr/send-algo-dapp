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


    const algodClient = new algosdk.Algodv2('', 'https://api.testnet.algoexplorer.io', '');
    const { Buffer } = buffer;
    if (!window.Buffer) window.Buffer = Buffer;

    const myAlgoWallet = new MyAlgoConnect();

    const params = await algodClient.getTransactionParams().do();

    const accounts = await myAlgoWallet.connect();
    const addresses = accounts.map(account => account.address);

    var sender = accounts[0].address;
    var amount = (parseInt(data.amount) * 1000000);
    var receiverAddr = data.receiverAddr;
    var note = undefined;


    let txn = algosdk.makePaymentTxnWithSuggestedParams(sender, receiverAddr, amount, undefined, note, params);

    const signedTxn = await myAlgoWallet.signTransaction(txn.toByte());

    const response = await algodClient.sendRawTransaction(signedTxn.blob).do();

    console.log(response);

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
            {/* <label htmlFor="firstname">First Name</label> */}
            <TextField {...register("receiverAddr", { required: true })} name="receiverAddr" margin="normal" label="Receiver Address" autoFocus variant="outlined" fullWidth type="text" />
            {
              errors.receiverAddr && <div className="error"> Enter Receiver Address</div>
            }
          </div>
          <div>
            {/* <label htmlFor="age">Age</label> */}
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
