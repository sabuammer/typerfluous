<script>
    import {NotificationDisplay, notifier} from "@beyonk/svelte-notifications";
    import {digestMessage} from "../utils";
    import fire from "../config/fire";
    import Identicon from "identicon.js";
    import {goto} from "@sapper/app";

    // For the registration form
    let email;
    let password;
    let confirmPassword;

    function handleRegister() {
        if (!email || !password || !confirmPassword) {
            notifier.warning("Please fill out incomplete fields", 2000);
        } else if (password !== confirmPassword) {
            notifier.warning("Passwords do not match", 3500);
        } else {
            fire
                    .auth()
                    .createUserWithEmailAndPassword(email, password)
                    .then(async data => {
                                const {user} = data;
                                if (user) {
                                    let emailHash = await digestMessage(user.email);
                                    let data = new Identicon(emailHash, 200).toString();
                                    let imageData = `data:image/png;base64,${data}`;
                                    let avatarRef = fire.storage().ref(`profile/${user.uid}`);

                                    await avatarRef.putString(imageData, 'data_url');

                                    let url = await avatarRef.getDownloadURL();

                                    await user.updateProfile({
                                        displayName: user.displayName,
                                        photoURL: url
                                    });

                                    await goto("/");
                                }
                            }
                    )
                    .catch(err => {
                        notifier.danger(err, 3500);
                    });
        }
    }
</script>

<style>
    div {
        display: flex;
        flex-direction: column;
        padding: 35px;
        margin-top: 15px;
        border-radius: 7px;
        min-width: 40%;
        background: #c8d2e0;
    }

    input {
        border: none transparent;
        outline: none;
        background: #9aa2ad;
        border-radius: 3px;
        padding: 10px;
        line-height: 1.5em;
        margin-top: 10px;
    }

    label {
        margin-top: 25px;
        font-size: 1.35em;
    }

    button {
        background: #5a5d63;
        color: white;
        margin-top: 50px;
        font-size: 1.35em;
        border-radius: 3px;
        padding: 5px;
        border: none;
    }

    h1 {
        margin: 0;
        font-size: 2em;
        font-weight: bold;
    }
</style>

<NotificationDisplay/>
<div>
    <h1>Register</h1>
    <label for="emailRegister">Email</label>
    <input
            type="text"
            name="emailRegister"
            id="emailRegister"
            bind:value={email}/>
    <label for="passwordRegister">Password</label>
    <input
            type="password"
            name="passwordRegister"
            id="passwordRegister"
            bind:value={password}/>
    <label for="confirmPassword">Confirm Password</label>
    <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            bind:value={confirmPassword}/>
    <button on:click={handleRegister}>
        Register
    </button>
</div>
