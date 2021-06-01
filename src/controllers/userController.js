import User from "../models/User";
import bcrypt from "bcrypt";
import fetch from "node-fetch";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  const { name, email, username, password, password2, location } = req.body;
  const pageTitle = "Join";
  if (password !== password2 || password === "") {
    return res.status(400).render("join", {
      pageTitle,
      errMsg:
        "🔴Password confirmation does not match or please enter password ",
    });
  }
  if (await User.exists({ $or: [{ username }, { email }] })) {
    return res.status(400).render("join", {
      pageTitle,
      errMsg: "🔴This username/email is already taken",
    });
  }
  try {
    await User.create({
      name,
      email,
      username,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).redirect("/join", {
      pageTitle,
      errMsg: error._message,
    });
  }
};
export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });
export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, socialOnly: false });
  const pageTitle = "Login";
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errMsg: "🔴We don't have such username",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errMsg: "🔴Wrong Password",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const config = {
    client_id: process.env.GH_CLIENT,
    scope: "read:user user:email",
  };
  const baseUrl = "https://github.com/login/oauth/authorize";
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find((email) => email.primary && email.verified);
    if (!emailObj) res.redirect("/login");
    let user = await User.findOne({ email: emailObj.email });
    const userUserName = await User.exists({ username: userData.login });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: !userData.name ? "Enter your name" : userData.name,
        email: emailObj.email,
        username: userUserName
          ? emailObj.email + "##username##"
          : userData.login,
        socialOnly: true,
        password: "",
        location: !userData.location ? "Enter your location" : userData.name,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else res.redirect("/login");
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};
export const postEdit = async (req, res) => {
  const {
    session: { user: beforeUser },
    session: {
      user: { _id },
    },
    body: { name, username, location, email },
  } = req;
  const currentUser = { username, email }; //Editable Ch
  for (let key in currentUser) {
    if (beforeUser[key] !== currentUser[key]) {
      if (await User.exists({ [key]: currentUser[key] }))
        res.render("edit-profile", {
          pageTitle: "Edit Profile",
          errMsg: `🔴This ${key} is already taken`,
        });
    }
  }
  await User.findByIdAndUpdate(_id, {
    name,
    username,
    location,
    email,
  });
  const userObj = { name, username, location, email };
  for (let key in userObj) {
    req.session.user[key] = userObj[key];
  }
  return res.redirect("/");
};
export const remove = (req, res) => res.send("<h1>Remove User</h1>");
export const see = (req, res) => {
  return res.send(`<h1>See User</h1> ${JSON.stringify(req.params)}`);
};
