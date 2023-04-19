let userNameInput = document.querySelector("#username");
let passwordInput = document.querySelector("#password");
let loginDiv = document.querySelector("#loginDiv");
let getUsersBtn = document.querySelector("#getUsers");
let registerBtn = document.querySelector("#register");
let registerNewUser = document.querySelector("#registerNewUser");
let registerDiv = document.querySelector("#registerDiv");
let registerUsername = document.querySelector("#registerUsername");
let registerPassword = document.querySelector("#registerPassword");
let registerEmail = document.querySelector("#registerEmail");
let loginBtn = document.querySelector("#login");
let startLoginBtn = document.querySelector("#startLogin");
let startLogoutBtn = document.querySelector("#startLogout");
let welcomeP = document.querySelector("#welcomeUser");
let main = document.querySelector("#displayBooks");
let toRead = document.querySelector("#toRead");
let books = document.querySelector("#books");
let ratedBooks = document.querySelector("#ratedBooks");
let ratedTitleBtn = document.querySelector("#ratedTitle");
let ratedAuthorBtn = document.querySelector("#ratedAuthor");
let ratedRatingBtn = document.querySelector("#ratedRating");
let homeBtn = document.querySelector("#home");
let profile = document.querySelector("#profile");
let btnDiv = document.querySelector("#ratedBooksButtons");
let hero = document.querySelector("#hero");
let asideH2 = document.querySelector("#aside-h2");
let asideP = document.querySelector("#h2");

toRead.classList.add("hidden");
asideP.classList.add("hidden");
btnDiv.classList.add("hidden");

let loggedIn = () => {
  if (sessionStorage.getItem("token")) {
    loginDiv.classList.add("hidden");
    registerDiv.classList.add("hidden");
    startLoginBtn.classList.add("hidden");
    // welcomeP.innerText =
    //   "You are logged in as " + sessionStorage.getItem("userName");
  } else {
    loginDiv.classList.add("hidden");
    registerDiv.classList.add("hidden");
    startLogoutBtn.classList.add("hidden");
  }
};
loggedIn();

let login = async () => {
  let response = await axios.post("http://localhost:1338/api/auth/local", {
    identifier: userNameInput.value,
    password: passwordInput.value,
  });
  console.log(response.data);
  let data = response.data;
  sessionStorage.setItem("token", data.jwt);
  sessionStorage.setItem("loginId", response.data.user.id);
  sessionStorage.setItem("userName", response.data.user.username);
  userId = response.data.user.id;
  welcomeP.innerText = "You are logged in as " + data.user.username;
  loginDiv.classList.add("hidden");
  startLogoutBtn.classList.remove("hidden");
  getBooks();
};

let registerUser = async () => {
  let response = await axios.post(
    "http://localhost:1338/api/auth/local/register",
    {
      username: registerUsername.value,
      password: registerPassword.value,
      email: registerEmail.value,
    }
  );
  let data = response.data;
  sessionStorage.setItem("token", data.jwt);
  sessionStorage.setItem("loginId", response.data.user.id);
  sessionStorage.setItem("userName", response.data.user.username);
  welcomeP.innerText = "You are logged in as " + data.user.username;
  loginDiv.classList.add("hidden");
  startLogoutBtn.classList.remove("hidden");
};

let register = () => {
  loginDiv.classList.add("hidden");
  registerDiv.classList.remove("hidden");
};

let logout = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("loginId");
  sessionStorage.removeItem("userName");
  welcomeP.innerText = "You are logged out";
  loginDiv.classList.remove("hidden");
  startLogoutBtn.classList.add("hidden");
};

registerBtn.addEventListener("click", register);
registerNewUser.addEventListener("click", registerUser);
startLoginBtn.addEventListener("click", () => {
  loginDiv.classList.remove("hidden");
});

// logut
startLogoutBtn.addEventListener("click", () => {
  logout();
  books.innerHTML = "";
  getBooks();
  location.reload();
});

/* Login */
loginBtn.addEventListener("click", () => {
  login();
  books.innerHTML = "";
  startLoginBtn.classList.add("hidden");
  getBooks();
});

let favoriteBook = async (bookId) => {
  try {
    let response = await axios.put(
      `http://localhost:1338/api/books/${bookId}`,
      {
        data: {
          users: {
            connect: [sessionStorage.getItem("loginId")],
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    let data = response.data;
  } catch (error) {
    console.log(error);
  }
};

let rateBook = async (bookId, rating) => {
  try {
    let response = await axios.post(
      `http://localhost:1338/api/user-ratings`,
      {
        data: {
          rating: rating,
          books: {
            connect: [bookId],
          },
          users: {
            connect: [sessionStorage.getItem("loginId")],
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    response = await axios.get(
      `http://localhost:1338/api/user-ratings?filter[books]=${bookId}&populate=books`
    );
    let userRatings = response.data;
    // Skapa en ny array med alla ratings för en bok
    let userRatingsByBook = {};
    userRatings.data.forEach((userRating) => {
      let bookId = userRating.attributes.books.data[0].id;
      if (!userRatingsByBook[bookId]) {
        userRatingsByBook[bookId] = [];
      }
      userRatingsByBook[bookId].push(userRating);
    });
    // Loopa igenom alla böcker
    for (const bookId in userRatingsByBook) {
      let totalRating = 0;

      // Loopa igenom alla användares ratings för en bok
      for (const userRating of userRatingsByBook[bookId]) {
        totalRating += userRating.attributes.rating;
      }
      const avgRating = Math.round(
        totalRating / userRatingsByBook[bookId].length
      );

      await axios.put(
        `http://localhost:1338/api/books/${bookId}`,
        {
          data: {
            rating: avgRating,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
    }
  } catch (error) {
    console.log(error);
  }
};

let toggleButtonAndRating = (button, ratingDiv) => {
  if (sessionStorage.getItem("token")) {
    button.classList.remove("hidden");
    ratingDiv.classList.remove("hidden");
  } else {
    button.classList.add("hidden");
    ratingDiv.classList.add("hidden");
  }
};

let createBookDiv = (book) => {
  let { bookcover, title, pages, author, releasedate, rating } =
    book.attributes;
  let div = document.createElement("div");
  div.innerHTML = `
  <img src="http://localhost:1338${bookcover.data[0].attributes.url}" alt="bookcover">
    <div id="divdiv">
    <h2>${title}</h2>
    <p>${author}</p>
    <p>${pages}</p>
    <p>${releasedate}</p>
    <p id="rating-${book.id}">${rating}</p>
    <div class="rating">
      <span class="star" data-rating="1">&#9734;</span>
      <span class="star" data-rating="2">&#9734;</span>
      <span class="star" data-rating="3">&#9734;</span>
      <span class="star" data-rating="4">&#9734;</span>
      <span class="star" data-rating="5">&#9734;</span>
      </div>
    <button id="favoriteBtn${book.id}">Add to favorites</button>
    <p id="favoriteText${book.id}"></p>
      </div>
  `;
  let button = div.querySelector(`#favoriteBtn${book.id}`);
  let ratingDiv = div.querySelector(`.rating`);
  toggleButtonAndRating(button, ratingDiv);

  button.addEventListener("click", () => {
    let divdiv = document.querySelector(`#favoriteText${book.id}`);
    button.classList.add("hidden");
    favoriteBook(book.id);
    divdiv.innerHTML = `Added to favorites`;
  });

  let stars = div.querySelectorAll(".star");
  stars.forEach((star) => {
    star.addEventListener("click", async () => {
      let rating = star.getAttribute("data-rating");
      await rateBook(book.id, rating);
      let ratingText = document.querySelector(`#rating-${book.id}`);
      ratingText.innerText = await getBookRating(book.id);

      // Replace star HTML with filled-in star up to and including the clicked star
      for (let i = 1; i <= rating; i++) {
        stars[i - 1].innerHTML = "&#9733;"; // filled-in star symbol
      }

      // Replace star HTML with outlined star after the clicked star
      for (let i = Number(rating) + 1; i <= stars.length; i++) {
        stars[i - 1].innerHTML = "&#9734;"; // outlined star symbol
      }
    });
  });

  return div;
};

let getBooks = async () => {
  try {
    let response = await axios.get(
      "http://localhost:1338/api/books?populate=deep,3"
    );
    let data = response.data.data;
    let divs = data.map(createBookDiv);
    divs.forEach((div) => books.appendChild(div));
  } catch (error) {
    console.log(error);
  }
};

getBooks();

let getBookRating = async (bookId) => {
  try {
    let response = await axios.get(`http://localhost:1338/api/books/${bookId}`);
    let book = response.data;
    return book.data.attributes.rating;
  } catch (error) {
    console.log(error);
    return null;
  }
};

let toReadList = async () => {
  let response = await axios.get(
    `http://localhost:1338/api/users/me?populate=deep,3`,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }
  );
  let data = response.data;
  data.books.forEach((book) => {
    let { bookcover, title, pages, author, releasedate, rating } = book;
    let div = document.createElement("div");
    div.innerHTML = `
      <img src="http://localhost:1338${bookcover[0].url}" alt="bookcover">
      <div>
        <h2>${title}</h2>
        <p>${author}</p>
        <p>${pages}</p>
        <p>${releasedate}</p>
        <p>${rating}</p>
        <button id="readBtn${book.id}">Read</button>
        </div>
      `;
    let button = div.querySelector(`#readBtn${book.id}`);

    button.addEventListener("click", () => {
      readBooks(book.id);
      div.innerHTML = "";
    });
    toRead.appendChild(div);
  });
};

let readBooks = async (bookId) => {
  try {
    let response = await axios.put(
      `http://localhost:1338/api/books/${bookId}`,
      {
        data: {
          users: {
            disconnect: [sessionStorage.getItem("loginId")],
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
  } catch (error) {
    console.log(error);
  }
};

let ratedBooksF = async () => {
  let response = await axios.get(
    `http://localhost:1338/api/users/me?populate=deep,4`,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }
  );
  let data = response.data;
  data.user_ratings.forEach((book) => {
    let { bookcover, title, pages, author, releasedate, rating } =
      book.books[0];
    let div = document.createElement("div");
    div.innerHTML = `
      <img src="http://localhost:1338${bookcover[0].url}" alt="bookcover">
      <div>
        <h2>${title}</h2>
        <p>${author}</p>
        <p>${pages}</p>
        <p>${releasedate}</p>
        <p>${rating}</p>
        </div>
      `;
    ratedBooks.appendChild(div);
  });
};

let sortTitle = async () => {
  try {
    let response = await axios.get(
      "http://localhost:1338/api/users/me/?populate=deep,4",
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    let data = response.data.user_ratings;
    data.sort((a, b) => a.books[0].title.localeCompare(b.books[0].title));

    data.forEach((book) => {
      let { bookcover, title, pages, author, releasedate, rating } =
        book.books[0];
      let div = document.createElement("div");
      div.innerHTML = `
        <img src="http://localhost:1338${bookcover[0].url}" alt="bookcover">
        <div>
          <h2>${title}</h2>
          <p>${author}</p>
          <p>${pages}</p>
          <p>${releasedate}</p>
          <p>${rating}</p>
          </div>
        `;
      ratedBooks.appendChild(div);
    });
  } catch (error) {
    console.log(error);
  }
};

let sortAuthor = async () => {
  try {
    let response = await axios.get(
      "http://localhost:1338/api/users/me/?populate=deep,4",
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    let data = response.data.user_ratings;
    // Sort the data array by title in ascending order
    data.sort((a, b) => a.books[0].author.localeCompare(b.books[0].author));

    data.forEach((book) => {
      let { bookcover, title, pages, author, releasedate, rating } =
        book.books[0];
      let div = document.createElement("div");
      div.innerHTML = `
      <img src="http://localhost:1338${bookcover[0].url}" alt="bookcover">
      <div>
        <h2>${title}</h2>
        <p>${author}</p>
        <p>${pages}</p>
        <p>${releasedate}</p>
        <p>${rating}</p>
        </div>
      `;
      ratedBooks.appendChild(div);
    });
  } catch (error) {
    console.log(error);
  }
};

let sortRating = async () => {
  try {
    let response = await axios.get(
      "http://localhost:1338/api/users/me/?populate=deep,4",
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    let data = response.data.user_ratings;
    data.sort((a, b) => b.books[0].rating - a.books[0].rating);
    data.forEach((book) => {
      let { bookcover, title, pages, author, releasedate, rating } =
        book.books[0];
      let div = document.createElement("div");
      div.innerHTML = `
      <img src="http://localhost:1338${bookcover[0].url}" alt="bookcover">
      <div>
        <h2>${title}</h2>
        <p>${author}</p>
        <p>${pages}</p>
        <p>${releasedate}</p>
        <p>${rating}</p>
        </div>
      `;
      ratedBooks.appendChild(div);
    });
  } catch (error) {
    console.log(error);
  }
};

ratedRatingBtn.addEventListener("click", () => {
  ratedBooks.innerHTML = "";
  sortRating();
});

ratedTitleBtn.addEventListener("click", () => {
  ratedBooks.innerHTML = "";
  sortTitle();
});

ratedAuthorBtn.addEventListener("click", () => {
  ratedBooks.innerHTML = "";
  sortAuthor();
});

profile.addEventListener("click", () => {
  toRead.classList.remove("hidden");
  ratedBooks.classList.remove("hidden");
  main.classList.add("hidden");
  btnDiv.classList.remove("hidden");
  hero.classList.add("hidden");
  asideP.classList.remove("hidden");
  toRead.innerHTML = "";
  ratedBooks.innerHTML = "";
  asideH2.innerHTML = `Welcome back, ${sessionStorage.getItem("userName")}!`;
  toReadList();
  ratedBooksF();
});

homeBtn.addEventListener("click", () => {
  main.classList.remove("hidden");
  toRead.classList.add("hidden");
  ratedBooks.classList.add("hidden");
  hero.classList.remove("hidden");
  btnDiv.classList.add("hidden");
  asideP.classList.add("hidden");
  asideH2.innerHTML = "";
});

let theme = async () => {
  let response = await axios.get("http://localhost:1338/api/theme");
  let data = response.data.data.attributes;
  console.log(data);
  let { theme } = data;
  if (theme === "darkmode") {
    document.querySelector("body").classList.add("darkmode");
  } else {
    document.querySelector("body").classList.remove("darkmode");
  }
  if (theme === "rainbow") {
    document.querySelector("body").classList.add("rainbow");
  } else {
    document.querySelector("body").classList.remove("rainbow");
  }
  if (theme === "lightmode") {
    document.querySelector("body").classList.add("lightmode");
  } else {
    document.querySelector("body").classList.remove("lightmode");
  }
};

theme();
