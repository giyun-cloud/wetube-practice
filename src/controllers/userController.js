import User from "../models/User";
import Video from "../models/Video";
import bcrypt from "bcrypt";
import fetch from "node-fetch";

//JOIN
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

//LOGIN
export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });
export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, socialOnly: false });
  const pageTitle = "Login";
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errMsg: "🔴We don't have such username or You have a Github ID",
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

//GITHUBLOGIN
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
        location: !userData.location ? "Enter your location" : userData.name,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else res.redirect("/login");
};

//LOGOUT
export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

//EDIT
export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};
export const postEdit = async (req, res) => {
  const {
    session: { user: beforeUser },
    session: {
      user: { _id: id, avatarUrl },
    },
    body: { name, username, location, email },
    file,
  } = req;
  const currentUser = { username, email };
  for (let key in currentUser) {
    if (beforeUser[key] !== currentUser[key])
      if (await User.exists({ [key]: currentUser[key] }))
        return res.status(400).render("edit-profile", {
          pageTitle: "Edit Profile",
          errMsg: `🔴This ${key} is already taken`,
        });
  }
  const user = await User.findByIdAndUpdate(
    id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name,
      username,
      location,
      email,
    },
    { new: true },
  );
  req.session.user = user;
  return res.redirect("/");
};

//CHANGE PASSWORD
export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly) return res.redirect("/");
  return res.render("users/change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id, password },
    },
    body: { oldPW, newPW, newPWConfirm },
  } = req;

  const adress = "users/change-password",
    pageTitle = "Change Password",
    errMsg = [
      "🔴The password does not match the confirmation",
      "🔴Same as old password",
      "🔴The current password is incorrect",
    ];

  if (newPW !== newPWConfirm)
    return res.status(400).render(adress, {
      pageTitle,
      errMsg: errMsg[0],
    });

  if (oldPW === newPW)
    return res.status(400).render(adress, {
      pageTitle,
      errMsg: errMsg[1],
    });

  if (!(await bcrypt.compare(oldPW, password)))
    return res.status(400).render(adress, {
      pageTitle,
      errMsg: errMsg[2],
    });

  const user = await User.findById(_id);
  user.password = newPW;
  user.save();
  console.log(user.password);
  req.session.user.password = user.password;
  console.log(user.password);
  res.redirect("/users/logout");
};

export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate("videos");
  if (!user) {
    return res.status(404).render("404", { pageTitle: "404 User Not Found" });
  }
  return res.render("users/profile", { pageTitle: user.name, user });
};

export const remove = (req, res) => res.send("<h1>Remove User</h1>");
