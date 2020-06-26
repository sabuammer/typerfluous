<script>
    import {createForm} from "svelte-forms-lib";
    import * as yup from "yup";
    import {digestMessage} from "../utils";
    import fire from "../config/fire";
    import Identicon from "identicon.js";
    import {goto} from "@sapper/app";

    const {form, errors, state, handleChange, handleSubmit} = createForm({
        initialValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: ""
        },
        validationSchema: yup.object().shape({
            username: yup
                    .string()
                    .min(3, "Username must be at least 3 characters")
                    .max(30, "Username can't be more than 30 characters")
                    .test("unique-username", "Username already taken",
                            async function (value) {
                                let duplicate = false;

                                await fire.database().ref(`usernames/${value}`).once("value", snapshot => {
                                    duplicate = snapshot.exists();
                                });

                                return !duplicate;
                            })
                    .required("Username is required"),
            email: yup
                    .string()
                    .email("Invalid email address")
                    .required("Email address is required"),
            password: yup
                    .string()
                    .min(6, "Password must be at least 6 characters long")
                    .required("Password is required"),
            confirmPassword: yup
                    .string()
                    .oneOf([yup.ref("password"), null], "Passwords must match")
        }),
        onSubmit: values => {
            const {username, email, password} = values;

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

                                    let usernamesUpdate = {};
                                    usernamesUpdate[username] = user.uid;

                                    let usersUpdate = {};
                                    usersUpdate[`${user.uid}/username`] = username;

                                    await fire.database().ref("usernames").update(usernamesUpdate);
                                    await fire.database().ref("users").update(usersUpdate);

                                    await goto("/");
                                }
                            }
                    )
                    .catch(err => {
                        console.log({err});
                    });
        }
    })
</script>

<style>
    form {
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

<form on:submit={handleSubmit}>
    <h1>Register</h1>
    <label for="username">Username</label>
    <input
            type="text"
            name="username"
            id="username"
            bind:value={$form.username}>
    {#if $errors.username}
        <span class="error">{$errors.username}</span>
    {/if}
    <label for="emailRegister">Email</label>
    <input
            type="text"
            name="emailRegister"
            id="emailRegister"
            bind:value={$form.email}>
    {#if $errors.email}
        <span class="error">{$errors.email}</span>
    {/if}
    <label for="passwordRegister">Password</label>
    <input
            type="password"
            name="passwordRegister"
            id="passwordRegister"
            bind:value={$form.password}/>
    {#if $errors.password}
        <span class="error">{$errors.password}</span>
    {/if}
    <label for="confirmPassword">Confirm Password</label>
    <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            bind:value={$form.confirmPassword}/>
    {#if $errors.confirmPassword}
        <span class="error">{$errors.confirmPassword}</span>
    {/if}
    <button type="submit">Register</button>
</form>
