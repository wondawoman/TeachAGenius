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
  
curriculum:
  "Curriculum Map",
  
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

grades:
  "Grade Calculator",

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

  
buildStandardMapping(
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
/*
==============================================
SANITIZE LOCAL DATA
==============================================
*/




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


 const sanitizedData =
  createSanitizedDataset(
    localAssessmentData
  );


const studentAverages =
  calculateStudentAverages(
    sanitizedData
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


 const questionMappings =
  collectQuestionMappings();


const questionStats =
  calculateQuestionPerformance(
    sanitizedData,
    questionMappings
  );


displayMasteryResults(
  classAverage,
  classifications,
  studentAverages.length,
  questionStats
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
  totalStudents,
  questionStats
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
const masteryBandSummary =
  document.getElementById(
    "masteryBandSummary"
  );


const questionBreakdown =
  document.getElementById(
    "questionBreakdown"
  );



const masteredPercent =
  (
    classifications.mastered
    /
    totalStudents
  )
  *
  100;


const meetsPercent =
  (
    classifications.meets
    /
    totalStudents
  )
  *
  100;


const approachingPercent =
  (
    classifications.approaching
    /
    totalStudents
  )
  *
  100;


const notYetPercent =
  (
    classifications.notYet
    /
    totalStudents
  )
  *
  100;



masteryBandSummary.innerHTML = `

  <div class="band-card">

    <span>
      Mastered
    </span>

    <strong>
      ${masteredPercent.toFixed(0)}%
    </strong>

  </div>


  <div class="band-card">

    <span>
      Meets
    </span>

    <strong>
      ${meetsPercent.toFixed(0)}%
    </strong>

  </div>


  <div class="band-card">

    <span>
      Approaching
    </span>

    <strong>
      ${approachingPercent.toFixed(0)}%
    </strong>

  </div>


  <div class="band-card">

    <span>
      Not Yet
    </span>

    <strong>
      ${notYetPercent.toFixed(0)}%
    </strong>

  </div>

`;



const sortedQuestions =
  [...questionStats]
    .sort(
      (
        a,
        b
      ) =>
        a.average -
        b.average
    );



const questionRows =
  sortedQuestions
    .map(
      item => {

        const scoreClass =
          item.average < 70
            ? "question-weak"
            : "question-strong";


        return `

          <div class="question-row">

            <span>
              ${item.label}
            </span>

            <span
              class="question-score ${scoreClass}"
            >
              ${item.average.toFixed(1)}%
            </span>

          </div>

        `;

      }
    )
    .join("");



questionBreakdown.innerHTML = `

  <h5>
    Question / Skill Performance
  </h5>

  ${questionRows}

`;

  const skillSummary =
  document.getElementById(
    "skillSummary"
  );


const skillResults =
  buildInstructionalDecisions(
    questionStats
  );


const skillCards =
  skillResults
    .map(
      item => {

        return `

          <div
            class="skill-card ${item.className}"
          >

            <strong>
              ${item.skill}
            </strong>

            <span>
              Class mastery:
              ${item.average.toFixed(1)}%
            </span>

            <p>
              ${item.recommendation}
            </p>
${
  item.average < 75
    ? `
      <button
        class="reteach-button"
        data-skill="${item.skill}"
        data-average="${item.average}"
      >
        Build Reteach
      </button>
    `
    : `
      <button
        class="reteach-button"
        data-skill="${item.skill}"
        data-average="${item.average}"
      >
        Build Extension
      </button>
    `
}
          </div>

        `;

      }
    )
    .join("");


skillSummary.innerHTML = `

  <h5>
    Instructional Next Steps
  </h5>

  ${skillCards}

`;
}
/*
==============================================
QUESTION PERFORMANCE
==============================================
*/


function calculateQuestionPerformance(
  data,
  mappings
) {

  const results = [];


  data.headers.forEach(
    (
      header,
      columnIndex
    ) => {

      const scores = [];


      data.rows.forEach(
        row => {

          const numericValue =
            Number(
              row[columnIndex]
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


      results.push({

  question:
    header,

  label:
    mappings[header] ||
    header,

  average:
    average

});

      }

    }
  );


  return results;

}


function createSanitizedDataset(
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

    "birthday",

    "parent",

    "guardian",

    "address",

    "phone"

  ];


  const safeColumnIndexes =
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


  const safeHeaders =
    safeColumnIndexes
      .map(
        index =>
          data.headers[index]
      );


  const safeRows =
    data.rows
      .map(
        row =>
          safeColumnIndexes
            .map(
              index =>
                row[index]
            )
      );


  return {

    headers:
      safeHeaders,

    rows:
      safeRows

  };

}
/*
==============================================
BUILD STANDARD MAPPING
==============================================
*/


function buildStandardMapping(
  headers
) {

  const standardMapping =
    document.getElementById(
      "standardMapping"
    );


  const identifierWords = [

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


  const safeHeaders =
    headers.filter(
      header => {

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


        return !isIdentifier;

      }
    );


  standardMapping.innerHTML =
    safeHeaders
      .map(
        (
          header,
          index
        ) => {

          return `

            <div class="mapping-row">

              <div class="mapping-question">

                ${header}

              </div>


              <input
                type="text"
                class="standard-input"
                data-question="${header}"
                placeholder="Example: TEKS 117.315 or Camera Angles"
              >

            </div>

          `;

        }
      )
      .join("");

}
/*
==============================================
COLLECT QUESTION MAPPINGS
==============================================
*/


function collectQuestionMappings() {

  const inputs =
    document.querySelectorAll(
      ".standard-input"
    );


  const mappings = {};


  inputs.forEach(
    input => {

      const question =
        input.dataset.question;


      const label =
        input.value.trim();


      mappings[question] =
        label ||
        question;

    }
  );


  return mappings;

}
/*
==============================================
INSTRUCTIONAL DECISION ENGINE
==============================================
*/


function buildInstructionalDecisions(
  questionStats
) {

  const groupedSkills = {};


  questionStats.forEach(
    item => {

      const skill =
        item.label;


      if (
        !groupedSkills[skill]
      ) {

        groupedSkills[skill] = [];

      }


      groupedSkills[skill].push(
        item.average
      );

    }
  );


  const skillResults =
    Object
      .entries(
        groupedSkills
      )
      .map(
        (
          [
            skill,
            scores
          ]
        ) => {

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


          let recommendation = "";

          let className = "";


          if (
            average < 60
          ) {

            recommendation =
              "Whole-group reteach recommended.";

            className =
              "reteach-whole";

          }

          else if (
            average < 75
          ) {

            recommendation =
              "Targeted small-group reteach recommended.";

            className =
              "reteach-small";

          }

          else {

            recommendation =
              "Class is generally ready to move forward or extend.";

            className =
              "reteach-good";

          }


          return {

            skill:
              skill,

            average:
              average,

            recommendation:
              recommendation,

            className:
              className

          };

        }
      );


  return skillResults
    .sort(
      (
        a,
        b
      ) =>
        a.average -
        b.average
    );

}
/*
==============================================
MASTERY → RETEACH HANDOFF
==============================================
*/


document.addEventListener(
  "click",
  function (
    event
  ) {

    if (
      !event.target
        .classList
        .contains(
          "reteach-button"
        )
    ) {

      return;

    }


    const skill =
      event.target
        .dataset
        .skill;


    const average =
      Number(
        event.target
          .dataset
          .average
      );


    sendSkillToLessonBuilder(
      skill,
      average
    );

  }
);



function sendSkillToLessonBuilder(
  skill,
  average
) {

  let format = "";

  let atBats = 0;

  let cfu = "";


  if (
    average < 60
  ) {

    format =
      "Whole-group reteach";

    atBats =
      4;

    cfu =
      "Every 5–7 minutes";

  }

  else if (
    average < 75
  ) {

    format =
      "Targeted small-group reteach";

    atBats =
      3;

    cfu =
      "Every 8–10 minutes";

  }

  else {

    format =
      "Extension / spiral review";

    atBats =
      2;

    cfu =
      "Midpoint and DOL";

  }


  document
    .getElementById(
      "reteachContext"
    )
    .classList
    .remove(
      "hidden"
    );


  document
    .getElementById(
      "reteachSkill"
    )
    .textContent =
      skill;


  document
    .getElementById(
      "reteachMastery"
    )
    .textContent =
      average.toFixed(1)
      + "%";


  document
    .getElementById(
      "reteachFormat"
    )
    .textContent =
      format;


  document
    .getElementById(
      "reteachAtBats"
    )
    .textContent =
      atBats;


  document
    .getElementById(
      "reteachCFU"
    )
    .textContent =
      cfu;


  document
    .getElementById(
      "lessonStandard"
    )
    .value =
      skill;


  navigateTo(
    "plan"
  );

}
/*
==============================================
LESSON STRUCTURE ENGINE
==============================================
*/


const buildLessonButton =
  document.getElementById(
    "buildLessonButton"
  );


buildLessonButton.addEventListener(
  "click",
  buildLessonStructure
);



function buildLessonStructure() {

  const standard =
    document
      .getElementById(
        "lessonStandard"
      )
      .value
      .trim();


  const classLength =
    Number(
      document
        .getElementById(
          "classLength"
        )
        .value
    );
const learningObjective =
  document
    .getElementById(
      "learningObjective"
    )
    .value
    .trim();


const dolPrompt =
  document
    .getElementById(
      "dolPrompt"
    )
    .value
    .trim();


const mrsStrategy =
  document
    .getElementById(
      "mrsStrategy"
    )
    .value;


const atBatCount =
  Number(
    document
      .getElementById(
        "atBatCount"
      )
      .value
  );


const classContext =
  document
    .getElementById(
      "classContext"
    )
    .value
    .trim();

  if (
    !standard
  ) {

    alert(
      "Enter a standard or skill first."
    );

    return;

  }


  const lessonStructure =
    document.getElementById(
      "lessonStructure"
    );


 const blocks =
  createLessonBlocks(
    classLength,
    {
      standard:
        standard,

      learningObjective:
        learningObjective,

      dolPrompt:
        dolPrompt,

      mrsStrategy:
        mrsStrategy,

      atBatCount:
        atBatCount,

      classContext:
        classContext
    }
  );


  const blockHtml =
    blocks
      .map(
        block => {

          return `

            <div class="lesson-block">

              <div class="lesson-time">
                ${block.minutes} min
              </div>

              <div>

                <strong>
                  ${block.label}
                </strong>

                <p>
                  ${block.description}
                </p>
<p class="lesson-step-note">
  ${block.note || ""}
</p>
              </div>

            </div>

          `;

        }
      )
      .join("");


 lessonStructure.innerHTML = `

  <div class="lesson-plan-header">

    <span class="eyebrow">
      Generated Instructional Structure
    </span>

    <h4>
      ${standard}
    </h4>


    <div class="lesson-detail">

      <strong>
        Learning Objective
      </strong>

      ${learningObjective || "Not entered"}

    </div>


    <div class="lesson-detail">

      <strong>
        DOL / Exit Ticket
      </strong>

      ${dolPrompt || "Not entered"}

    </div>


    <div class="lesson-detail">

      <strong>
        MRS
      </strong>

      ${getMrsLabel(mrsStrategy)}

    </div>


    <span class="atbat-badge">
      ${atBatCount} planned at-bats
    </span>

  </div>

  ${blockHtml}

`;


  lessonStructure
    .classList
    .remove(
      "hidden"
    );

}
/*
==============================================
CLASS-TIME ENGINE
==============================================
*/


function createLessonBlocks(
  classLength,
  context
) {
const mrsLabel =
  getMrsLabel(
    context.mrsStrategy
  );


const objectiveText =
  context.learningObjective
    ||
    "Introduce and practice the target skill.";


const dolText =
  context.dolPrompt
    ||
    "Students independently demonstrate the target skill.";


const learnerContext =
  context.classContext
    ||
    "Use checks for understanding to adjust support.";
  if (
    classLength === 30
  ) {

    return [

      {
        minutes: 5,
        label: "Do Now",
        description:
          "Activate prior knowledge and prepare students for the target skill."
      },

      {
        minutes: 5,
        label: "Mini Lesson",
        description:
          "Model the core concept with one clear example."
      },

      {
        minutes: 10,
        label: "Guided Practice / At-Bats",
        description:
          "Students practice the skill multiple times with immediate feedback."
      },

      {
        minutes: 5,
        label: "CFU / Reteach",
        description:
          "Check understanding and respond to misconceptions."
      },

      {
        minutes: 5,
        label: "DOL / Exit Ticket",
        description:
          "Students independently demonstrate the learning target."
      }

    ];

  }



  if (
    classLength === 45
  ) {

    return [

      {
        minutes: 5,
        label: "Do Now",
        description:
          "Activate prior knowledge."
      },

      {
        minutes: 10,
        label: "Direct Instruction",
        description:
          "Teach and model the target skill."
      },

      {
        minutes: 10,
        label: "Guided Practice",
        description:
          "Practice with teacher support."
      },

      {
        minutes: 10,
        label: "Independent At-Bats",
        description:
          "Students repeatedly apply the skill."
      },

      {
        minutes: 10,
        label: "DOL / Exit Ticket",
        description:
          "Measure independent mastery."
      }

    ];

  }



  if (
    classLength === 60
  ) {

    return [

      {
        minutes: 5,
        label: "Do Now",
        description:
          "Activate prior knowledge."
      },

      {
        minutes: 10,
        label: "Launch / Objective",
        description:
          "Establish what students are learning and why."
      },

      {
        minutes: 15,
        label: "Direct Instruction",
        description:
          "Model the skill and expose the thinking process."
      },

      {
        minutes: 15,
        label: "Guided Practice / At-Bats",
        description:
          "Students practice with frequent checks for understanding."
      },

      {
        minutes: 5,
        label: "Targeted Reteach",
        description:
          "Respond to misconceptions before independent assessment."
      },

      {
        minutes: 10,
        label: "DOL / Exit Ticket",
        description:
          "Measure mastery independently."
      }

    ];

  }



 return [

  {
    minutes: 5,

    label:
      "Do Now",

    description:
      "Activate prerequisite knowledge connected to "
      + context.standard
      + ".",

    note:
      "Use a fast entry task that lets you immediately see what students already know."

  },


  {
    minutes: 10,

    label:
      "Launch / Learning Objective",

    description:
      objectiveText,

    note:
      "State the target clearly, connect it to prior learning, and establish what success will look like."

  },


  {
    minutes: 20,

    label:
      "I Do / Direct Instruction",

    description:
      "Model "
      + context.standard
      + " using a clear exemplar and visible thinking.",

    note:
      learnerContext

  },


  {
    minutes: 10,

    label:
      "MRS + CFU",

    description:
      "Use "
      + mrsLabel
      + " to require every learner to respond.",

    note:
      "Check for misconceptions before releasing students into deeper practice."

  },


  {
    minutes: 20,

    label:
      "We Do / Guided At-Bats",

    description:
      "Students complete approximately "
      + context.atBatCount
      + " meaningful repetitions of the target skill.",

    note:
      "Each at-bat should measure the same learning in a slightly different context."

  },


  {
    minutes: 15,

    label:
      "You Do / Independent Application",

    description:
      "Students independently apply "
      + context.standard
      + ".",

    note:
      "Use current mastery information to decide who needs scaffolds, reteach, or extension."

  },


  {
    minutes: 10,

    label:
      "DOL / Exit Ticket",

    description:
      dolText,

    note:
      "This final task should independently measure the learning objective without teacher prompting."

  }

];

}
/*
==============================================
MRS LABEL ENGINE
==============================================
*/


function getMrsLabel(
  strategy
) {

  const labels = {

    "turn-talk":
      "Turn and Talk",

    "whiteboards":
      "Whiteboards / Response Boards",

    "four-corners":
      "Four Corners",

    "fist-five":
      "Fist to Five",

    "partner-sayback":
      "Partner Say-Back"

  };


  return labels[strategy]
    || strategy;

}
/*
==============================================
DIFFERENTIATION ENGINE
==============================================
*/


const generateSupportButton =
  document.getElementById(
    "generateSupportButton"
  );


const sendSupportsToLessonButton =
  document.getElementById(
    "sendSupportsToLessonButton"
  );


let currentSupportPlan = null;



generateSupportButton
  .addEventListener(
    "click",
    generateDifferentiationPlan
  );



function generateDifferentiationPlan() {

  const alias =
    document
      .getElementById(
        "learnerAlias"
      )
      .value
      .trim();


  const languageSupport =
    document
      .getElementById(
        "languageSupport"
      )
      .value;


  const observation =
    document
      .getElementById(
        "learningObservation"
      )
      .value
      .trim();


  const selectedSupports =
    Array
      .from(
        document.querySelectorAll(
          ".support-check:checked"
        )
      )
      .map(
        checkbox =>
          checkbox.value
      );


  if (
    !alias
  ) {

    alert(
      "Enter a non-identifying learner alias first."
    );

    return;

  }


  const supports =
    buildSupportRecommendations(
      languageSupport,
      selectedSupports,
      observation
    );


  currentSupportPlan = {

    alias:
      alias,

    languageSupport:
      languageSupport,

    selectedSupports:
      selectedSupports,

    observation:
      observation,

    recommendations:
      supports

  };


  displayDifferentiationPlan(
    currentSupportPlan
  );

}
/*
==============================================
SUPPORT RECOMMENDATION RULES
==============================================
*/


function buildSupportRecommendations(
  languageSupport,
  selectedSupports,
  observation
) {

  const recommendations = [];


  if (
    languageSupport === "light"
  ) {

    recommendations.push({

      title:
        "Language Access",

      text:
        "Preview key academic vocabulary and provide sentence stems for discussion or written response."

    });

  }


  if (
    languageSupport === "moderate"
  ) {

    recommendations.push({

      title:
        "Language Access",

      text:
        "Use visuals, modeled examples, vocabulary support, structured partner rehearsal, and sentence stems before independent response."

    });

  }


  if (
    languageSupport === "intensive"
  ) {

    recommendations.push({

      title:
        "Language Access",

      text:
        "Provide translated directions when appropriate, visual modeling, repeated oral rehearsal, structured peer support, and simplified language without reducing the academic target."

    });

  }



  selectedSupports.forEach(
    support => {

      const recommendation =
        getSupportRecommendation(
          support
        );


      if (
        recommendation
      ) {

        recommendations.push(
          recommendation
        );

      }

    }
  );


  if (
    observation
  ) {

    recommendations.push({

      title:
        "Teacher Observation",

      text:
        "Use the teacher observation as a check point during guided practice: "
        + observation

    });

  }


  return recommendations;

}
/*
==============================================
SUPPORT STRATEGY LIBRARY
==============================================
*/


function getSupportRecommendation(
  support
) {

  const strategies = {


    visuals: {

      title:
        "Visual Support",

      text:
        "Pair directions and examples with a visible model, exemplar, image, diagram, or demonstration."

    },


    chunking: {

      title:
        "Chunk Directions",

      text:
        "Break multi-step tasks into smaller sections and confirm completion before moving to the next step."

    },


    processing: {

      title:
        "Processing Time",

      text:
        "Build additional think time before requiring an oral or written response."

    },


    modeling: {

      title:
        "Repeated Modeling",

      text:
        "Provide another modeled example before independent practice and explicitly narrate the thinking process."

    },


    vocabulary: {

      title:
        "Vocabulary Scaffold",

      text:
        "Preteach essential vocabulary and keep key terms visible during practice."

    },


    partner: {

      title:
        "Structured Partner Talk",

      text:
        "Allow rehearsal with a partner before whole-group or independent response."

    },


    writing: {

      title:
        "Response Load",

      text:
        "Reduce unnecessary writing volume while maintaining the same academic thinking requirement."

    },


    movement: {

      title:
        "Movement / Reset",

      text:
        "Build a brief structured movement or reset opportunity before the next sustained learning task."

    },


    checkins: {

      title:
        "Teacher Check-Ins",

      text:
        "Schedule brief teacher check-ins during guided and independent practice rather than waiting until the DOL."

    },


    extension: {

      title:
        "Extension",

      text:
        "Increase complexity, transfer, justification, or real-world application rather than adding repetitive work."

    }

  };


  return strategies[support]
    || null;

}
/*
==============================================
DISPLAY DIFFERENTIATION PLAN
==============================================
*/


function displayDifferentiationPlan(
  plan
) {

  const supportResults =
    document.getElementById(
      "supportResults"
    );


  const supportAlias =
    document.getElementById(
      "supportAlias"
    );


  const supportPlan =
    document.getElementById(
      "supportPlan"
    );


  supportAlias.textContent =
    plan.alias;


  const supportHtml =
    plan.recommendations
      .map(
        recommendation => {

          return `

            <div class="support-item">

              <strong>
                ${recommendation.title}
              </strong>

              <span>
                ${recommendation.text}
              </span>

            </div>

          `;

        }
      )
      .join("");


  supportPlan.innerHTML =
    supportHtml;


  supportResults
    .classList
    .remove(
      "hidden"
    );

}
/*
==============================================
DIFFERENTIATION → LESSON BUILDER
==============================================
*/


sendSupportsToLessonButton
  .addEventListener(
    "click",
    sendSupportsToLesson
  );



function sendSupportsToLesson() {

  if (
    !currentSupportPlan
  ) {

    alert(
      "Generate a support plan first."
    );

    return;

  }


  const classContext =
    document.getElementById(
      "classContext"
    );


  const supportSummary =
    currentSupportPlan
      .recommendations
      .map(
        item =>
          item.title
          + ": "
          + item.text
      )
      .join(" ");


  const existingContext =
    classContext
      .value
      .trim();


  if (
    existingContext
  ) {

    classContext.value =
      existingContext
      + "\n\nAnonymous Learner Support — "
      + currentSupportPlan.alias
      + ": "
      + supportSummary;

  }

  else {

    classContext.value =
      "Anonymous Learner Support — "
      + currentSupportPlan.alias
      + ": "
      + supportSummary;

  }


  navigateTo(
    "plan"
  );

}
/*
==============================================
TEACHER SETTINGS
==============================================
*/


const saveSettingsButton =
  document.getElementById(
    "saveSettingsButton"
  );


const settingsSavedMessage =
  document.getElementById(
    "settingsSavedMessage"
  );



saveSettingsButton
  .addEventListener(
    "click",
    saveTeacherSettings
  );



function saveTeacherSettings() {

  const settings = {

    schoolLabel:
      document
        .getElementById(
          "schoolLabel"
        )
        .value
        .trim(),

    classLength:
      Number(
        document
          .getElementById(
            "defaultClassLength"
          )
          .value
      ),

    scheduleType:
      document
        .getElementById(
          "defaultScheduleType"
        )
        .value,

    doNowMinutes:
      Number(
        document
          .getElementById(
            "defaultDoNow"
          )
          .value
      ),

    dolMinutes:
      Number(
        document
          .getElementById(
            "defaultDol"
          )
          .value
      ),

    defaultMrs:
      document
        .getElementById(
          "defaultMrs"
        )
        .value,

    meetsThreshold:
      Number(
        document
          .getElementById(
            "defaultMeetsThreshold"
          )
          .value
      )

  };


  localStorage.setItem(
    "teachAGeniusSettings",
    JSON.stringify(
      settings
    )
  );
console.log(
  "Teacher settings saved:",
  settings
);


console.log(
  "Storage immediately after save:",
  localStorage.getItem(
    "teachAGeniusSettings"
  )
);

  settingsSavedMessage
    .classList
    .remove(
      "hidden"
    );


  applyTeacherSettings(
    settings
  );

}
/*
==============================================
LOAD TEACHER SETTINGS
==============================================
*/


function loadTeacherSettings() {

  const savedSettings =
    localStorage.getItem(
      "teachAGeniusSettings"
    );


  if (
    !savedSettings
  ) {

    return;

  }


  const settings =
    JSON.parse(
      savedSettings
    );


  document
    .getElementById(
      "schoolLabel"
    )
    .value =
      settings.schoolLabel
      || "";


  document
    .getElementById(
      "defaultClassLength"
    )
    .value =
      settings.classLength
      || 90;


  document
    .getElementById(
      "defaultScheduleType"
    )
    .value =
      settings.scheduleType
      || "daily";


  document
    .getElementById(
      "defaultDoNow"
    )
    .value =
      settings.doNowMinutes
      ?? 5;


  document
    .getElementById(
      "defaultDol"
    )
    .value =
      settings.dolMinutes
      ?? 10;


  document
    .getElementById(
      "defaultMrs"
    )
    .value =
      settings.defaultMrs
      || "turn-talk";


  document
    .getElementById(
      "defaultMeetsThreshold"
    )
    .value =
      settings.meetsThreshold
      ?? 70;


  applyTeacherSettings(
    settings
  );

}
/*
==============================================
APPLY TEACHER SETTINGS
==============================================
*/


function applyTeacherSettings(
  settings
) {

  const classLength =
    document.getElementById(
      "classLength"
    );


  const scheduleType =
    document.getElementById(
      "scheduleType"
    );


  const mrsStrategy =
    document.getElementById(
      "mrsStrategy"
    );


  const meetsThreshold =
    document.getElementById(
      "meetsThreshold"
    );


  if (
    classLength
  ) {

    classLength.value =
      settings.classLength
      || 90;

  }


  if (
    scheduleType
  ) {

    scheduleType.value =
      settings.scheduleType
      || "daily";

  }


  if (
    mrsStrategy
  ) {

    mrsStrategy.value =
      settings.defaultMrs
      || "turn-talk";

  }


  if (
    meetsThreshold
  ) {

    meetsThreshold.value =
      settings.meetsThreshold
      ?? 70;

  }

}
/*
==============================================
INITIALIZE TEACHER SETTINGS
==============================================
*/


loadTeacherSettings();
/*
==============================================
GRADE CALCULATOR
==============================================
*/


const addCategoryButton =
  document.getElementById(
    "addCategoryButton"
  );


const addAssignmentButton =
  document.getElementById(
    "addAssignmentButton"
  );


const calculateGradeButton =
  document.getElementById(
    "calculateGradeButton"
  );



addCategoryButton
  .addEventListener(
    "click",
    addCategoryRow
  );



function addCategoryRow() {

  const container =
    document.getElementById(
      "categoryWeightRows"
    );


  const row =
    document.createElement(
      "div"
    );


  row.className =
    "category-weight-row";


  row.innerHTML = `

    <input
      type="text"
      class="category-name"
      placeholder="Category"
    >

    <input
      type="number"
      class="category-weight"
      value="0"
      min="0"
      max="100"
    >

    <span>
      %
    </span>

  `;


  container.appendChild(
    row
  );


  refreshAssignmentCategories();

}
/*
==============================================
ASSIGNMENT ROWS
==============================================
*/


addAssignmentButton
  .addEventListener(
    "click",
    addAssignmentRow
  );



function addAssignmentRow() {

  const container =
    document.getElementById(
      "assignmentRows"
    );


  const row =
    document.createElement(
      "div"
    );


  row.className =
    "assignment-row";


  row.innerHTML = `

    <input
      type="text"
      class="assignment-name"
      placeholder="Assignment name"
    >


    <select
      class="assignment-category"
    >
    </select>


    <input
      type="number"
      class="assignment-earned"
      placeholder="Earned"
      min="0"
    >


    <input
      type="number"
      class="assignment-possible"
      placeholder="Possible"
      min="1"
    >


    <button
      type="button"
      class="remove-row-button"
      title="Remove assignment"
    >
      ×
    </button>

  `;


  container.appendChild(
    row
  );


  row
    .querySelector(
      ".remove-row-button"
    )
    .addEventListener(
      "click",
      function () {

        row.remove();

      }
    );


  refreshAssignmentCategories();

}
/*
==============================================
CATEGORY DROPDOWN ENGINE
==============================================
*/


function getGradeCategories() {

  const names =
    document.querySelectorAll(
      ".category-name"
    );


  const weights =
    document.querySelectorAll(
      ".category-weight"
    );


  const categories = [];


  names.forEach(
    (
      nameInput,
      index
    ) => {

      const name =
        nameInput.value.trim();


      const weight =
        Number(
          weights[index].value
        );


      if (
        name
      ) {

        categories.push({

          name:
            name,

          weight:
            weight

        });

      }

    }
  );


  return categories;

}



function refreshAssignmentCategories() {

  const categories =
    getGradeCategories();


  const dropdowns =
    document.querySelectorAll(
      ".assignment-category"
    );


  dropdowns.forEach(
    dropdown => {

      const previousValue =
        dropdown.value;


      dropdown.innerHTML =
        categories
          .map(
            category => {

              return `

                <option
                  value="${category.name}"
                >
                  ${category.name}
                </option>

              `;

            }
          )
          .join("");


      if (
        categories.some(
          category =>
            category.name ===
            previousValue
        )
      ) {

        dropdown.value =
          previousValue;

      }

    }
  );

}
document
  .getElementById(
    "categoryWeightRows"
  )
  .addEventListener(
    "input",
    refreshAssignmentCategories
  );
/*
==============================================
WEIGHTED GRADE ENGINE
==============================================
*/


calculateGradeButton
  .addEventListener(
    "click",
    calculateWeightedGrade
  );



function calculateWeightedGrade() {

  const categories =
    getGradeCategories();


  const totalWeight =
    categories.reduce(
      (
        total,
        category
      ) =>
        total + category.weight,
      0
    );


  if (
    Math.abs(
      totalWeight - 100
    ) > 0.01
  ) {

    alert(
      "Category weights must total 100%."
    );

    return;

  }


  const assignmentRows =
    document.querySelectorAll(
      ".assignment-row"
    );


  if (
    assignmentRows.length === 0
  ) {

    alert(
      "Add at least one assignment."
    );

    return;

  }


  const categoryScores = {};


  categories.forEach(
    category => {

      categoryScores[
        category.name
      ] = {

        earned:
          0,

        possible:
          0,

        weight:
          category.weight

      };

    }
  );


  assignmentRows.forEach(
    row => {

      const category =
        row
          .querySelector(
            ".assignment-category"
          )
          .value;


      const earned =
        Number(
          row
            .querySelector(
              ".assignment-earned"
            )
            .value
        );


      const possible =
        Number(
          row
            .querySelector(
              ".assignment-possible"
            )
            .value
        );


      if (
        !Number.isFinite(earned)
        ||
        !Number.isFinite(possible)
        ||
        possible <= 0
      ) {

        return;

      }


      if (
        categoryScores[
          category
        ]
      ) {

        categoryScores[
          category
        ].earned +=
          earned;


        categoryScores[
          category
        ].possible +=
          possible;

      }

    }
  );


  let weightedGrade = 0;

  let usedWeight = 0;


  const categoryResults = [];


  Object
    .entries(
      categoryScores
    )
    .forEach(
      (
        [
          category,
          data
        ]
      ) => {

        if (
          data.possible <= 0
        ) {

          return;

        }


        const average =
          (
            data.earned
            /
            data.possible
          )
          *
          100;


        weightedGrade +=
          average
          *
          (
            data.weight
            /
            100
          );


        usedWeight +=
          data.weight;


        categoryResults.push({

          category:
            category,

          average:
            average,

          weight:
            data.weight

        });

      }
    );


  if (
    usedWeight === 0
  ) {

    alert(
      "No valid assignment scores were entered."
    );

    return;

  }


  if (
    usedWeight < 100
  ) {

    weightedGrade =
      weightedGrade
      /
      (
        usedWeight
        /
        100
      );

  }


  displayGradeResults(
    weightedGrade,
    categoryResults
  );

}
/*
==============================================
LETTER GRADE ENGINE
==============================================
*/


function getLetterGrade(
  percentage
) {

  const a =
    Number(
      document
        .getElementById(
          "gradeA"
        )
        .value
    );


  const b =
    Number(
      document
        .getElementById(
          "gradeB"
        )
        .value
    );


  const c =
    Number(
      document
        .getElementById(
          "gradeC"
        )
        .value
    );


  const d =
    Number(
      document
        .getElementById(
          "gradeD"
        )
        .value
    );


  if (
    percentage >= a
  ) {

    return "A";

  }


  if (
    percentage >= b
  ) {

    return "B";

  }


  if (
    percentage >= c
  ) {

    return "C";

  }


  if (
    percentage >= d
  ) {

    return "D";

  }


  return "F";

}
/*
==============================================
DISPLAY GRADE RESULTS
==============================================
*/


function displayGradeResults(
  weightedGrade,
  categoryResults
) {

  const gradeResults =
    document.getElementById(
      "gradeResults"
    );


  const weightedGradeDisplay =
    document.getElementById(
      "weightedGrade"
    );


  const letterGradeDisplay =
    document.getElementById(
      "letterGrade"
    );


  const categoryResultsDisplay =
    document.getElementById(
      "categoryResults"
    );


  weightedGradeDisplay
    .textContent =
      weightedGrade
        .toFixed(1)
      + "%";


  letterGradeDisplay
    .textContent =
      getLetterGrade(
        weightedGrade
      );


  categoryResultsDisplay
    .innerHTML =
      categoryResults
        .map(
          result => {

            return `

              <div class="category-result-row">

                <span>
                  ${result.category}
                  (${result.weight}%)
                </span>

                <strong>
                  ${result.average.toFixed(1)}%
                </strong>

              </div>

            `;

          }
        )
        .join("");


  gradeResults
    .classList
    .remove(
      "hidden"
    );

}
/*
==============================================
INITIALIZE GRADE CALCULATOR
==============================================
*/


addAssignmentRow();

addAssignmentRow();
/*
==============================================
CLASSROOM ENGINE
==============================================
*/


const generateClassroomMoveButton =
  document.getElementById(
    "generateClassroomMoveButton"
  );


const sendMoveToLessonButton =
  document.getElementById(
    "sendMoveToLessonButton"
  );


let currentClassroomMove = null;



generateClassroomMoveButton
  .addEventListener(
    "click",
    generateClassroomMove
  );
function generateClassroomMove() {

  const situation = {

    phase:
      document
        .getElementById(
          "lessonPhase"
        )
        .value,

    classSize:
      document
        .getElementById(
          "classSize"
        )
        .value,

    response:
      document
        .getElementById(
          "responseLevel"
        )
        .value,

    engagement:
      document
        .getElementById(
          "engagementLevel"
        )
        .value,

    difficulty:
      document
        .getElementById(
          "difficultyLevel"
        )
        .value,

    need:
      document
        .getElementById(
          "instructionalNeed"
        )
        .value

  };


  currentClassroomMove =
    buildClassroomRecommendation(
      situation
    );


  displayClassroomMove(
    currentClassroomMove
  );

}
/*
==============================================
CLASSROOM RECOMMENDATION ENGINE
==============================================
*/


function buildClassroomRecommendation(
  situation
) {

  let mrs = "";

  let cfu = "";

  let atBats = "";

  let questioning = "";

  let teacherMove = "";



  /*
  MRS
  */


  if (
    situation.response === "low"
  ) {

    mrs =
      "Use an all-response strategy such as response boards, fist-to-five, or a structured partner response before calling on anyone.";

  }

  else if (
    situation.engagement === "low"
  ) {

    mrs =
      "Use a movement-based or partner-response strategy to reset attention and require every learner to participate.";

  }

  else {

    mrs =
      "Use Turn and Talk followed by a random or targeted share-out so every learner rehearses thinking before whole-group response.";

  }



  /*
  CFU
  */


  if (
    situation.difficulty === "complex"
  ) {

    cfu =
      "Use a two-part CFU: first check the answer, then require students to justify how or why they reached it.";

  }

  else if (
    situation.response === "low"
  ) {

    cfu =
      "Use a fast visible CFU where every student must respond at the same time.";

  }

  else {

    cfu =
      "Pause and check understanding before moving to the next instructional step. Look for patterns, not only individual answers.";

  }



  /*
  AT-BATS
  */


  if (
    situation.phase === "guided"
  ) {

    atBats =
      "Use 3–4 short repetitions with immediate feedback. Keep the skill constant while slightly changing the context.";

  }

  else if (
    situation.phase === "independent"
  ) {

    atBats =
      "Use 2–3 independent repetitions before the DOL so students demonstrate the skill without teacher prompting.";

  }

  else {

    atBats =
      "Build at least 2 opportunities for students to actively use the target skill before moving forward.";

  }



  /*
  QUESTIONING
  */


  if (
    situation.difficulty === "complex"
  ) {

    questioning =
      "Use questions that require students to compare, justify, defend, predict, or explain the impact of a choice.";

  }

  else if (
    situation.response === "low"
  ) {

    questioning =
      "Start with an accessible entry question, allow rehearsal time, then increase complexity after students commit to an answer.";

  }

  else {

    questioning =
      "Move from What? → How? → Why? so students progress from recall into explanation.";

  }



  /*
  TEACHER MOVE
  */


  if (
    situation.need === "reteach"
  ) {

    teacherMove =
      "Stop forward movement briefly. Model one more example, identify the misconception, then immediately give students another attempt.";

  }

  else if (
    situation.need === "atbats"
  ) {

    teacherMove =
      "Reduce teacher talk and increase student repetitions. Watch the first attempt, correct quickly, then release the next attempt.";

  }

  else if (
    situation.need === "questioning"
  ) {

    teacherMove =
      "Ask fewer questions, but require deeper answers. Give think time and ask students to support responses with evidence or reasoning.";

  }

  else if (
    situation.need === "cfu"
  ) {

    teacherMove =
      "Do not ask 'Does everyone understand?' Use a response that lets you actually see the entire room's understanding.";

  }

  else {

    teacherMove =
      "Require a response from every learner before selecting individuals to speak publicly.";

  }


  return {

    title:
      getClassroomMoveTitle(
        situation.need
      ),

    mrs:
      mrs,

    cfu:
      cfu,

    atBats:
      atBats,

    questioning:
      questioning,

    teacherMove:
      teacherMove

  };

}
function getClassroomMoveTitle(
  need
) {

  const titles = {

    mrs:
      "Increase Student Response",

    cfu:
      "Check for Understanding",

    reteach:
      "Immediate Reteach Move",

    questioning:
      "Deepen Student Thinking",

    atbats:
      "Increase At-Bats"

  };


  return titles[need]
    || "Classroom Move";

}
/*
==============================================
DISPLAY CLASSROOM MOVE
==============================================
*/


function displayClassroomMove(
  move
) {

  const results =
    document.getElementById(
      "classroomMoveResults"
    );


  const title =
    document.getElementById(
      "classroomMoveTitle"
    );


  const plan =
    document.getElementById(
      "classroomMovePlan"
    );


  title.textContent =
    move.title;


  plan.innerHTML = `

    <div class="classroom-move-card">

      <strong>
        MRS Strategy
      </strong>

      ${move.mrs}

    </div>


    <div class="classroom-move-card">

      <strong>
        CFU
      </strong>

      ${move.cfu}

    </div>


    <div class="classroom-move-card">

      <strong>
        At-Bats
      </strong>

      ${move.atBats}

    </div>


    <div class="classroom-move-card">

      <strong>
        Questioning
      </strong>

      ${move.questioning}

    </div>


    <div class="classroom-move-card">

      <strong>
        Teacher Move
      </strong>

      ${move.teacherMove}

    </div>

  `;


  results
    .classList
    .remove(
      "hidden"
    );

}
/*
==============================================
CLASSROOM → LESSON BUILDER
==============================================
*/


sendMoveToLessonButton
  .addEventListener(
    "click",
    sendClassroomMoveToLesson
  );



function sendClassroomMoveToLesson() {

  if (
    !currentClassroomMove
  ) {

    alert(
      "Generate a classroom move first."
    );

    return;

  }


  const classContext =
    document.getElementById(
      "classContext"
    );


  const summary =
    "Classroom Strategy — "
    +
    "MRS: "
    + currentClassroomMove.mrs
    +
    " CFU: "
    + currentClassroomMove.cfu
    +
    " At-Bats: "
    + currentClassroomMove.atBats
    +
    " Questioning: "
    + currentClassroomMove.questioning
    +
    " Teacher Move: "
    + currentClassroomMove.teacherMove;


  const existing =
    classContext
      .value
      .trim();


  if (
    existing
  ) {

    classContext.value =
      existing
      + "\n\n"
      + summary;

  }

  else {

    classContext.value =
      summary;

  }


  navigateTo(
    "plan"
  );

}
/*
==============================================
CURRICULUM INTERNALIZATION ENGINE
==============================================
*/


const internalizeCurriculumButton =
  document.getElementById(
    "internalizeCurriculumButton"
  );


const sendCurriculumToLessonButton =
  document.getElementById(
    "sendCurriculumToLessonButton"
  );


let currentCurriculumPlan = null;



internalizeCurriculumButton
  .addEventListener(
    "click",
    internalizeCurriculum
  );
function internalizeCurriculum() {

  const course =
    document
      .getElementById(
        "curriculumCourse"
      )
      .value
      .trim();


  const unit =
    document
      .getElementById(
        "curriculumUnit"
      )
      .value
      .trim();


  const standard =
    document
      .getElementById(
        "curriculumStandard"
      )
      .value
      .trim();


  const skill =
    document
      .getElementById(
        "curriculumSkill"
      )
      .value
      .trim();


  const startDate =
    document
      .getElementById(
        "curriculumStart"
      )
      .value;


  const endDate =
    document
      .getElementById(
        "curriculumEnd"
      )
      .value;


  const meetings =
    Number(
      document
        .getElementById(
          "curriculumMeetings"
        )
        .value
    );


  const assessment =
    document
      .getElementById(
        "curriculumAssessment"
      )
      .value;


  const prerequisite =
    document
      .getElementById(
        "curriculumPrerequisite"
      )
      .value
      .trim();


  if (
    !course
    ||
    !unit
    ||
    !standard
    ||
    !skill
  ) {

    alert(
      "Enter the course, unit, standard, and essential skill."
    );

    return;

  }


  if (
    !Number.isFinite(
      meetings
    )
    ||
    meetings < 1
  ) {

    alert(
      "Enter at least one instructional meeting."
    );

    return;

  }


  currentCurriculumPlan =
    buildCurriculumPlan({

      course:
        course,

      unit:
        unit,

      standard:
        standard,

      skill:
        skill,

      startDate:
        startDate,

      endDate:
        endDate,

      meetings:
        meetings,

      assessment:
        assessment,

      prerequisite:
        prerequisite

    });


  displayCurriculumPlan(
    currentCurriculumPlan
  );

}
/*
==============================================
CURRICULUM PLAN BUILDER
==============================================
*/


function buildCurriculumPlan(
  data
) {

  const sequence = [];


  for (
    let meeting = 1;
    meeting <= data.meetings;
    meeting++
  ) {

    let focus = "";

    let purpose = "";


    if (
      meeting === 1
    ) {

      focus =
        "Launch + Prior Knowledge";

      purpose =
        "Introduce the unit, surface prerequisite knowledge, and establish what students will need to learn.";

    }

    else if (
      meeting === data.meetings
    ) {

      focus =
        "Assessment + Mastery Check";

      purpose =
        "Students independently demonstrate the essential skill and provide evidence of mastery.";

    }

    else if (
      meeting ===
      data.meetings - 1
    ) {

      focus =
        "Independent Application";

      purpose =
        "Students apply the target skill independently before the final assessment.";

    }

    else {

      focus =
        "Instruction + Guided Practice";

      purpose =
        "Model the target skill, check understanding, and provide repeated at-bats with feedback.";

    }


    sequence.push({

      meeting:
        meeting,

      focus:
        focus,

      purpose:
        purpose

    });

  }


  return {

    course:
      data.course,

    unit:
      data.unit,

    standard:
      data.standard,

    skill:
      data.skill,

    startDate:
      data.startDate,

    endDate:
      data.endDate,

    meetings:
      data.meetings,

    assessment:
      getAssessmentLabel(
        data.assessment
      ),

    prerequisite:
      data.prerequisite,

    sequence:
      sequence

  };

}
function getAssessmentLabel(
  assessment
) {

  const labels = {

    dol:
      "DOL / Exit Ticket",

    quiz:
      "Quiz",

    project:
      "Project / Performance Task",

    exam:
      "Unit Exam",

    portfolio:
      "Portfolio / Product"

  };


  return labels[assessment]
    || assessment;

}
/*
==============================================
DISPLAY CURRICULUM PLAN
==============================================
*/


function displayCurriculumPlan(
  plan
) {

  const results =
    document.getElementById(
      "curriculumResults"
    );


  const title =
    document.getElementById(
      "curriculumResultTitle"
    );


  const summary =
    document.getElementById(
      "curriculumSummary"
    );


  title.textContent =
    plan.unit;


  const sequenceHtml =
    plan.sequence
      .map(
        item => {

          return `

            <div class="curriculum-day">

              <strong>
                Meeting ${item.meeting}:
                ${item.focus}
              </strong>

              <span>
                ${item.purpose}
              </span>

            </div>

          `;

        }
      )
      .join("");


  summary.innerHTML = `

    <div class="curriculum-summary-card">

      <strong>
        Course
      </strong>

      ${plan.course}

    </div>


    <div class="curriculum-summary-card">

      <strong>
        Standard / TEKS
      </strong>

      ${plan.standard}

    </div>


    <div class="curriculum-summary-card">

      <strong>
        Essential Skill
      </strong>

      ${plan.skill}

    </div>


    <div class="curriculum-summary-card">

      <strong>
        Assessment
      </strong>

      ${plan.assessment}

    </div>


    <div class="curriculum-summary-card">

      <strong>
        Prerequisite Learning
      </strong>

      ${plan.prerequisite || "Not entered"}

    </div>


    <div class="curriculum-summary-card">

      <strong>
        Instructional Window
      </strong>

      ${plan.startDate || "Not entered"}
      →
      ${plan.endDate || "Not entered"}

    </div>


    <div class="curriculum-summary-card">

      <strong>
        Instructional Sequence
      </strong>

      <div class="curriculum-sequence">

        ${sequenceHtml}

      </div>

    </div>

  `;


  results
    .classList
    .remove(
      "hidden"
    );

}
/*
==============================================
CURRICULUM → LESSON BUILDER
==============================================
*/


sendCurriculumToLessonButton
  .addEventListener(
    "click",
    sendCurriculumToLesson
  );



function sendCurriculumToLesson() {

  if (
    !currentCurriculumPlan
  ) {

    alert(
      "Internalize a unit first."
    );

    return;

  }


  const lessonStandard =
    document.getElementById(
      "lessonStandard"
    );


  const learningObjective =
    document.getElementById(
      "learningObjective"
    );


  const classContext =
    document.getElementById(
      "classContext"
    );


  lessonStandard.value =
    currentCurriculumPlan.skill;


  if (
    !learningObjective.value.trim()
  ) {

    learningObjective.value =
      "Students will demonstrate "
      +
      currentCurriculumPlan.skill
      +
      " aligned to "
      +
      currentCurriculumPlan.standard
      +
      ".";

  }


  const curriculumContext =
    "Curriculum Context — Unit: "
    +
    currentCurriculumPlan.unit
    +
    ". Standard: "
    +
    currentCurriculumPlan.standard
    +
    ". Prerequisite: "
    +
    (
      currentCurriculumPlan.prerequisite
      ||
      "Not specified"
    )
    +
    ". Assessment: "
    +
    currentCurriculumPlan.assessment
    +
    ".";


  const existingContext =
    classContext
      .value
      .trim();


  if (
    existingContext
  ) {

    classContext.value =
      existingContext
      +
      "\n\n"
      +
      curriculumContext;

  }

  else {

    classContext.value =
      curriculumContext;

  }


  navigateTo(
    "plan"
  );

}
