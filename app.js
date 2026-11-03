/*
==============================================
TEACHER OS
MAIN FRONT-END CONTROLLER
==============================================
*/


const navButtons =
  document.querySelectorAll(
    ".nav-button"
  );


const moduleCards =
  document.querySelectorAll(
    ".module-card"
  );


const pages =
  document.querySelectorAll(
    ".page"
  );


const pageTitle =
  document.getElementById(
    "pageTitle"
  );



const pageNames = {

  dashboard:
    "Dashboard",

  plan:
    "Lesson Builder",

  mastery:
    "Mastery Analyzer",

  differentiate:
    "Differentiation",

  classroom:
    "Classroom Strategies",

  translate:
    "Live Translation",

  settings:
    "Teacher Settings"

};



function navigateTo(
  pageName
) {


  pages.forEach(
    page => {

      page.classList.remove(
        "active-page"
      );

    }
  );


  const targetPage =
    document.getElementById(
      pageName
    );


  if (
    targetPage
  ) {

    targetPage.classList.add(
      "active-page"
    );

  }


  navButtons.forEach(
    button => {

      button.classList.toggle(

        "active",

        button.dataset.page ===
          pageName

      );

    }
  );


  pageTitle.textContent =
    pageNames[
      pageName
    ] ||
    "Teacher OS";

}



navButtons.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        navigateTo(
          button.dataset.page
        );

      }
    );

  }
);



moduleCards.forEach(
  card => {

    card.addEventListener(
      "click",
      () => {

        navigateTo(
          card.dataset.open
        );

      }
    );

  }
);
