<script>
    import {NotificationDisplay, notifier} from "@beyonk/svelte-notifications";
    import {digestMessage} from "../utils";
    import fire from "../config/fire";
    import Identicon from "identicon.js";

    // For the registration form
    let username = "";
    let email = ""
    let password = "";
    let confirmPassword = "";

    let usernameError = "";
    let passwordError = "";
    let confirmPasswordError = "";

    function handleRegister() {
        if (password.length < 6) {
            passwordError = "Password must be greater than 6 characters";
        }

        if (password !== confirmPassword) {
            confirmPasswordError = "Passwords do not match";
        }
        if (passwordError || confirmPasswordError || usernameError) {
            notifier.danger("Please fix any outstanding errors", 2000);
        } else {
            fire
                    .auth()
                    .createUserWithEmailAndPassword(email, password)
                    .then(async data => {
                                const {user} = data;
                                if (user) {
                                    let emailHash = await digestMessage(user.email);
                                    let options = {
                                        background: [255, 255, 255, 255], // rgba white background
                                        size: 420,
                                        format: 'svg'
                                    }

                                    let data = new Identicon(emailHash, options).toString();
                                    let imageData = `data:image/svg+xml;base64,${data}`;
                                    let avatarRef = fire.storage().ref(`profile/${user.uid}`);

                                    await avatarRef.putString(imageData, 'data_url');

                                    let url = await avatarRef.getDownloadURL();

                                    await user.updateProfile({
                                        displayName: user.displayName,
                                        photoURL: url
                                    });
                                }
                            }
                    )
                    .catch(err => {
                        notifier.danger(err, 3500);
                    });
        }
    }

    function handleInput(e) {
        let currUsername = e.data ? username + e.data : username.slice(0, -1); // username is out of sync for some reason, so update it with e.data
        fire.database().ref(`usernames/${currUsername}`).once("value", snapshot => {
            if (snapshot.exists()) {
                // username already exists
                usernameError = "Username already exists";
            } else {
                usernameError = "";
            }
        });
    }

    //
    // fire.auth().onAuthStateChanged(user => {
    //     if (user) {
    //         fire.database().ref(`/users/${user.uid}`)
    //     }
    // });
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
        line-height: 1.25em;
        margin-top: 5px;
        border-bottom: 3px solid transparent;
    }

    input:focus {
        border-bottom: 3px solid #333;
    }

    label {
        margin-top: 20px;
        font-size: 1.25em;
    }

    button {
        background: #5a5d63;
        color: white;
        margin-top: 40px;
        font-size: 1.25em;
        border-radius: 3px;
        padding: 5px;
        border: none;
    }

    h1 {
        margin: 0 0 5px;
        font-size: 1.75em;
        font-weight: bold;
    }

    .error {
        color: red;
    }
</style>

<NotificationDisplay/>
<div>
    <h1>Register</h1>
    <label for="username">Username</label>
    <input
            type="text"
            name="username"
            id="username"
            on:input={handleInput}
            bind:value={username}>
    {#if usernameError}
        <span class="error">{usernameError}</span>
    {/if}
    <label for="emailRegister">Email</label>
    <input
            type="text"
            name="emailRegister"
            id="emailRegister"
            bind:value={email}>
    <label for="passwordRegister">Password</label>
    <input
            type="password"
            name="passwordRegister"
            id="passwordRegister"
            bind:value={password}/>
    {#if passwordError}
        <span class="error">{passwordError}</span>
    {/if}
    <label for="confirmPassword">Confirm Password</label>
    <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            bind:value={confirmPassword}/>
    {#if confirmPasswordError}
        <span class="error">{confirmPasswordError}</span>
    {/if}
    <button on:click={handleRegister}>
        Register
    </button>
</div>
