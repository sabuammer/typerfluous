<script>
    import {NotificationDisplay, notifier} from "@beyonk/svelte-notifications";
    import {fade} from "svelte/transition";
    import fire from "../config/fire";
    import {goto} from "@sapper/app";

    // For the login form
    let email;
    let password;

    function handleLogin() {
        if (!email || !password) {
            notifier.warning("Please fill out incomplete fields", 2000);
        } else {
            fire
                    .auth()
                    .signInWithEmailAndPassword(email, password)
                    .then(async user => {
                        await goto("/");
                    })
                    .catch(err => {
                        notifier.danger(err, 5000);
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

    h1 {
        margin: 0;
        font-size: 2em;
        font-weight: bold;
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
</style>

<NotificationDisplay/>
<div>
    <h1>Login</h1>
    <label for="email">Email</label>
    <input type="text" name="email" id="email" bind:value={email}/>
    <label for="password">Password</label>
    <input type="password" name="password" id="password" bind:value={password}/>
    <button on:click={handleLogin}>Log In</button>
</div>
