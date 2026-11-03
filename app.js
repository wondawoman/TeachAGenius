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
/*
==============================================
PRIVACY-FIRST MASTERY ANALYZER
==============================================
*/


const scoreFile =
  document.getElementById(
    "scoreFile"
  );


const fileName =
  document.getElementById(
    "fileName"
  );


const privacyScan =
  document.getElementById(
    "privacyScan"
  );


const privacyScanResults =
  document.getElementById(
    "privacyScanResults"
  );


const masterySettings =
  document.getElementById(
    "masterySettings"
  );


const masteryResults =
  document.getElementById(
    "masteryResults"
  );


const analyzeButton =
  document.getElementById(
    "analyzeButton"
  );



/*
The CSV data will exist only inside
this browser tab.

We are NOT uploading it.
*/

let localAssessmentData = null;



scoreFile.addEventListener(
  "change",
  handleScoreFile
);



function handleScoreFile(
  event
) {

  const file =
    event.target.files[0];


  if (
    !file
  ) {

    return;

  }


  fileName.textContent =
    file.name;


  if (
    !file.name
      .toLowerCase()
      .endsWith(".csv")
  ) {

    alert(
      "Please select a CSV file."
    );

    scoreFile.value = "";

    return;

  }


  const reader =
    new FileReader();


  reader.onload =
    function (
      loadEvent
    ) {

      const csvText =
        loadEvent
          .target
          .result;


      processLocalCsv(
        csvText
      );

    };


  reader.onerror =
    function () {

      alert(
        "The file could not be read."
      );

    };


  reader.readAsText(
    file
  );

}



/*
==============================================
LOCAL CSV PARSER
==============================================
*/


function processLocalCsv(
  csvText
) {

  const rows =
    csvText
      .trim()
      .split(/\r?\n/);


  if (
    rows.length < 2
  ) {

    alert(
      "This file does not contain enough data."
    );

    return;

  }


  const headers =
    rows[0]
      .split(",")
      .map(
        value =>
          value.trim()
      );


  const dataRows =
    rows
      .slice(1)
      .map(
        row =>
          row
            .split(",")
            .map(
              value =>
                value.trim()
            )
      );


  localAssessmentData = {

    headers:
      headers,

    rows:
      dataRows

  };


  runPrivacyScan(
    headers
  );

}



/*
==============================================
PRIVACY GATE
==============================================
*/


function runPrivacyScan(
  headers
) {

  const sensitiveWords = [

    "name",

    "student",

    "student id",

    "studentid",

    "id",

    "email",

    "dob",

    "birth",

    "birthday",

    "parent",

    "guardian",

    "address",

    "phone"

  ];


  const possibleIdentifiers =
    headers.filter(
      header => {

        const normalized =
          header
            .toLowerCase()
            .trim();


        return sensitiveWords
          .some(
            word =>
              normalized === word ||
              normalized.includes(
                word
              )
          );

      }
    );


  privacyScan.classList.remove(
    "hidden"
  );


  masterySettings.classList.remove(
    "hidden"
  );


  if (
    possibleIdentifiers.length === 0
  ) {

    privacyScanResults.innerHTML = `

      <div class="scan-item">

        <span>
          Direct identifier columns detected
        </span>

        <span class="scan-safe">
          None detected
        </span>

      </div>


      <div class="scan-item">

        <span>
          Processing location
        </span>

        <span class="scan-safe">
          This browser only
        </span>

      </div>

    `;

  }

  else {

    const identifierList =
      possibleIdentifiers.join(
        ", "
      );


    privacyScanResults.innerHTML = `

      <div class="scan-item">

        <span>
          Possible identifying columns
        </span>

        <span class="scan-warning">
          ${identifierList}
        </span>

      </div>


      <div class="scan-item">

        <span>
          Protection
        </span>

        <span class="scan-safe">
          Identifier columns will be excluded
          from score calculations
        </span>

      </div>


      <div class="scan-item">

        <span>
          File upload
        </span>

        <span class="scan-safe">
          No upload performed
        </span>

      </div>

    `;

  }

}



/*
==============================================
ANALYZE BUTTON
==============================================
*/


analyzeButton.addEventListener(
  "click",
  analyzeMastery
);



function analyzeMastery() {

  if (
    !localAssessmentData
  ) {

    alert(
      "Choose a score file first."
    );

    return;

  }


  const masteredThreshold =
    Number(
      document
        .getElementById(
          "masteredThreshold"
        )
        .value
    );


  const meetsThreshold =
    Number(
      document
        .getElementById(
          "meetsThreshold"
        )
        .value
    );


  const approachingThreshold =
    Number(
      document
        .getElementById(
          "approachingThreshold"
        )
        .value
    );


  if (
    !validateThresholds(
      masteredThreshold,
      meetsThreshold,
      approachingThreshold
    )
  ) {

    return;

  }


  const studentAverages =
    calculateStudentAverages(
      localAssessmentData
    );


  if (
    studentAverages.length === 0
  ) {

    alert(
      "No usable numeric scores were found."
    );

    return;

  }


  const classifications = {

    mastered:
      0,

    meets:
      0,

    approaching:
      0,

    notYet:
      0

  };


  studentAverages.forEach(
    average => {

      if (
        average >=
        masteredThreshold
      ) {

        classifications
          .mastered++;

      }

      else if (
        average >=
        meetsThreshold
      ) {

        classifications
          .meets++;

      }

      else if (
        average >=
        approachingThreshold
      ) {

        classifications
          .approaching++;

      }

      else {

        classifications
          .notYet++;

      }

    }
  );


  const classAverage =
    studentAverages
      .reduce(
        (
          total,
          score
        ) =>
          total + score,
        0
      )
      /
      studentAverages.length;


  displayMasteryResults(
    classAverage,
    classifications,
    studentAverages.length
  );

}



/*
==============================================
THRESHOLD VALIDATION
==============================================
*/


function validateThresholds(
  mastered,
  meets,
  approaching
) {

  if (
    mastered <= meets ||
    meets <= approaching
  ) {

    alert(
      "Thresholds must descend in this order: Mastered, Meets, Approaching."
    );

    return false;

  }


  return true;

}



/*
==============================================
CALCULATE STUDENT AVERAGES
==============================================
*/


function calculateStudentAverages(
  data
) {

  const identifierWords = [

    "name",

    "student",

    "student id",

    "studentid",

    "id",

    "email",

    "dob",

    "birth",

    "parent",

    "guardian",

    "address",

    "phone"

  ];


  const scoreColumnIndexes =
    data.headers
      .map(
        (
          header,
          index
        ) => {

          const normalized =
            header
              .toLowerCase()
              .trim();


          const isIdentifier =
            identifierWords
              .some(
                word =>
                  normalized === word ||
                  normalized.includes(
                    word
                  )
              );


          return isIdentifier
            ? null
            : index;

        }
      )
      .filter(
        index =>
          index !== null
      );


  const studentAverages = [];


  data.rows.forEach(
    row => {

      const scores = [];


      scoreColumnIndexes
        .forEach(
          index => {

            const numericValue =
              Number(
                row[index]
              );


            if (
              Number.isFinite(
                numericValue
              )
            ) {

              scores.push(
                numericValue
              );

            }

          }
        );


      if (
        scores.length > 0
      ) {

        const average =
          scores.reduce(
            (
              total,
              score
            ) =>
              total + score,
            0
          )
          /
          scores.length;


        studentAverages.push(
          average
        );

      }

    }
  );


  return studentAverages;

}



/*
==============================================
DISPLAY RESULTS
==============================================
*/


function displayMasteryResults(
  classAverage,
  classifications,
  totalStudents
) {

  masteryResults.classList.remove(
    "hidden"
  );


  document
    .getElementById(
      "classAverage"
    )
    .textContent =
      classAverage
        .toFixed(1)
      + "%";


  document
    .getElementById(
      "masteredCount"
    )
    .textContent =
      classifications
        .mastered;


  document
    .getElementById(
      "meetsCount"
    )
    .textContent =
      classifications
        .meets;


  document
    .getElementById(
      "approachingCount"
    )
    .textContent =
      classifications
        .approaching;


  document
    .getElementById(
      "notYetCount"
    )
    .textContent =
      classifications
        .notYet;


  const interventionCount =
    classifications
      .approaching
    +
    classifications
      .notYet;


  const interventionPercent =
    (
      interventionCount
      /
      totalStudents
    )
    *
    100;


  let message = "";


  if (
    interventionPercent >= 50
  ) {

    message =
      "More than half of the analyzed learners are below Meets. Consider a whole-group reteach before moving forward.";

  }

  else if (
    interventionCount > 0
  ) {

    message =
      interventionCount +
      " learner(s) are currently below Meets. Consider targeted small-group reteach while other learners move into extension work.";

  }

  else {

    message =
      "All analyzed learners are currently at Meets or Mastered based on the thresholds you selected.";

  }


  document
    .getElementById(
      "instructionalMessage"
    )
    .textContent =
      message;

}
