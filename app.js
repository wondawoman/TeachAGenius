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

const brandHomeButton =
  document.getElementById(
    "brandHomeButton"
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

const workspaceEyebrow =
  document.getElementById(
    "workspaceEyebrow"
  );

const pageNames = {

dashboard:
  "",
  
  curriculum:
    "Curriculum Map",
  
  plan:
    "Lesson Builder",

  mastery:
    "Mastery Analyzer",

  plc:
    "PLC Command Center",
  
differentiate:
  "Differentiation Engine",

classroom:
  "Classroom Engine",

translate:
  "Live Translation",

grades:
  "Grade Calculator",

  settings:
    "Teacher Settings"

};


function navigateTo(
  pageName,
  addToHistory = true
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
    "";


  if (
    workspaceEyebrow
  ) {

    workspaceEyebrow.textContent =
      pageName === "dashboard"
        ? "Teacher Workspace Dashboard"
        : "Teacher Workspace";

  }


  if (
    addToHistory
  ) {

    history.pushState(
      {
        page:
          pageName
      },
      "",
      `#${pageName}`
    );

  }

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

if (
  brandHomeButton
) {

  brandHomeButton.addEventListener(
    "click",
    () => {

      navigateTo(
        "dashboard"
      );

    }
  );

}

window.addEventListener(
  "popstate",
  event => {

    const pageName =
      event.state?.page ||
      window.location.hash.replace(
        "#",
        ""
      ) ||
      "dashboard";


    navigateTo(
      pageName,
      false
    );

  }
);

const initialPage =
  window.location.hash.replace(
    "#",
    ""
  ) ||
  "dashboard";


navigateTo(
  initialPage,
  false
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
let currentMasteryStats = [];
let currentDataActionBrief = null;



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

const firstLine =
  csvText
    .split(/\r?\n/)
    .find(line => line.trim() !== "");

const headerColumns =
  firstLine
    ? firstLine
        .split(",")
        .map(header =>
          header
            .replace(/^"|"$/g, "")
            .trim()
        )
    : [];

const privacyPreflight =
  runPrivacyHeaderPreflight(
    headerColumns
  );
if (!privacyPreflight.safe) {
  const blockedHeaders =
    privacyPreflight
      .unsafeHeaders
      .map(item => item.header)
      .join(", ");

  renderPrivacyScan(
    "blocked",
    privacyPreflight
      .unsafeHeaders
      .map(item => item.header)
  );

  alert(
    "Upload blocked.\n\n" +
    "This file appears to contain student-identifying information:\n\n" +
    blockedHeaders +
    "\n\nRemove those columns from your privacy-safe copy and upload again."
  );

  scoreFile.value = "";

  return;
}

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

   renderPrivacyScan(
  "safe"
);

  }

  else {

    const identifierList =
      possibleIdentifiers.join(
        ", "
      );


   renderPrivacyScan(
  "blocked",
  possibleIdentifiers
);
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
document.addEventListener(
  "click",
  function (event) {
    if (!event.target) {
      return;
    }

    if (
      event.target.id ===
      "generateAliasesButton"
    ) {
      generatePrivacyAliases();
    }

    if (
      event.target.id ===
      "copyAliasesButton"
    ) {
      copyGeneratedAliases();
    }
  }
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
currentMasteryStats = questionStats;

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

function generatePrivacyAliases() {
  const countInput =
    document.getElementById(
      "aliasStudentCount"
    );

  const results =
    document.getElementById(
      "aliasGeneratorResults"
    );

  if (!countInput || !results) {
    return;
  }

  const studentCount =
    Number(countInput.value);

  if (
    !Number.isInteger(studentCount) ||
    studentCount < 1
  ) {
    results.innerHTML =
      "<p>Enter the number of students first.</p>";

    return;
  }

  const aliasWords = [
    "Lotus",
    "Iris",
    "Nova",
    "Oak",
    "River",
    "Sage",
    "Cedar",
    "Willow",
    "Sol",
    "Sky"
  ];

  const aliases = [];

  for (
    let index = 0;
    index < studentCount;
    index += 1
  ) {
    const word =
      aliasWords[
        index % aliasWords.length
      ];

    const number =
      String(
        Math.floor(
          index / aliasWords.length
        ) + 1
      ).padStart(3, "0");

    aliases.push(
      `${word}${number}`
    );
  }
results.innerHTML = `
  <p>
    ${studentCount}
    privacy-safe aliases generated.
  </p>

  <textarea
    id="generatedAliasList"
    rows="10"
    readonly
  >${aliases.join("\n")}</textarea>

  <button
    type="button"
    id="copyAliasesButton"
  >
    Copy Alias Column
  </button>

  <p
    id="aliasCopyStatus"
    class="alias-copy-status"
  ></p>
`;
}
async function copyGeneratedAliases() {
  const aliasList =
    document.getElementById(
      "generatedAliasList"
    );

  const copyStatus =
    document.getElementById(
      "aliasCopyStatus"
    );

  if (!aliasList || !copyStatus) {
    return;
  }

  try {
    await navigator.clipboard.writeText(
      aliasList.value
    );

    copyStatus.textContent =
      "Aliases copied. Paste them into your privacy-safe spreadsheet copy.";
  } catch (error) {
    copyStatus.textContent =
      "Copy failed. Select the aliases and copy them manually.";
  }
}
async function copyDataActionBrief() {
  const copyStatus =
    document.getElementById(
      "dataActionBriefCopyStatus"
    );

  if (
    !currentDataActionBrief ||
    !copyStatus
  ) {
    return;
  }

  const briefText =
    formatDataActionBrief(
      currentDataActionBrief
    );

  try {
    await navigator.clipboard.writeText(
      briefText
    );

    copyStatus.textContent =
      "Data brief copied. Ready to paste.";
  } catch (error) {
    copyStatus.textContent =
      "Copy failed. Try again.";
  }
}
function renderPrivacyScan(
  status,
  identifyingColumns = []
) {
  const hasBlockedColumns =
    status === "blocked";

  const identifierText =
    identifyingColumns.length > 0
      ? identifyingColumns.join(", ")
      : "None detected";

  privacyScanResults.innerHTML = `
    <div class="scan-item">
      <span>
        Identifying columns
      </span>

      <span class="${
        hasBlockedColumns
          ? "scan-warning"
          : "scan-safe"
      }">
        ${identifierText}
      </span>
    </div>

    <div class="scan-item">
      <span>
        Privacy status
      </span>

      <span class="${
        hasBlockedColumns
          ? "scan-warning"
          : "scan-safe"
      }">
        ${
          hasBlockedColumns
            ? "Upload blocked until identifying columns are removed"
            : "Privacy check passed"
        }
      </span>
    </div>

    <div class="scan-item">
      <span>
        Data handling
      </span>

      <span class="scan-safe">
        Processed on this device
      </span>
    </div>

    <div class="privacy-prep">
      <h4>Before You Upload</h4>

      <p>
        TeachAGenius does not need student-identifying information.
      </p>

      <ol>
        <li>
          Make a copy of your spreadsheet or SIS report.
        </li>
        <li>
          Remove names, IDs, emails, usernames, and other identifying fields.
        </li>
        <li>
          Use TeachAGenius aliases before uploading your privacy-safe copy.
        </li>
      </ol>

      <div class="alias-generator">
        <label for="aliasStudentCount">
          Number of students
        </label>

        <input
          type="number"
          id="aliasStudentCount"
          min="1"
          placeholder="Example: 147"
        >

        <button
          type="button"
          id="generateAliasesButton"
        >
          Generate Aliases
        </button>

        <div
          id="aliasGeneratorResults"
          class="alias-generator-results"
        ></div>
      </div>
    </div>
  `;
}
function normalizePrivacyHeader(header) {
  return String(header)
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}
function findUnsafePrivacyHeaders(headers) {
  const unsafePatterns = [
    {
      category: "Student name",
      patterns: [
        /\bstudent name\b/,
        /\bfirst name\b/,
        /\blast name\b/,
        /\bfull name\b/,
        /^name$/
      ]
    },

    {
      category: "Student identifier",
      patterns: [
        /\bstudent id\b/,
        /\bstudent number\b/,
        /\blocal id\b/,
        /\bstate id\b/,
        /\bsis id\b/,
        /\bstudent key\b/,
        /\blearner id\b/,
        /\blearner key\b/
      ]
    },

    {
      category: "Account or login",
      patterns: [
        /\busername\b/,
        /\blogin\b/,
        /\buser id\b/,
        /\bstudent login\b/
      ]
    },

    {
      category: "Email",
      patterns: [
        /\bemail\b/,
        /\be mail\b/
      ]
    },

    {
      category: "Birth information",
      patterns: [
        /\bdob\b/,
        /\bdate of birth\b/,
        /\bbirth date\b/
      ]
    },

    {
      category: "Contact information",
      patterns: [
        /\bphone\b/,
        /\bphone number\b/,
        /\baddress\b/,
        /\bstreet address\b/
      ]
    },

    {
      category: "Parent or guardian information",
      patterns: [
        /\bparent\b/,
        /\bguardian\b/,
        /\bparent email\b/,
        /\bguardian email\b/
      ]
    }
  ];

  const unsafeHeaders = [];

  headers.forEach((header) => {
    const normalizedHeader =
      normalizePrivacyHeader(header);

    unsafePatterns.forEach((rule) => {
      const matched =
        rule.patterns.some((pattern) =>
          pattern.test(normalizedHeader)
        );

      if (matched) {
        unsafeHeaders.push({
          header: header,
          category: rule.category
        });
      }
    });
  });

  return unsafeHeaders;
}
function runPrivacyHeaderPreflight(headers) {
  const unsafeHeaders =
    findUnsafePrivacyHeaders(headers);

  if (unsafeHeaders.length === 0) {
    return {
      safe: true,
      unsafeHeaders: []
    };
  }

  return {
    safe: false,
    unsafeHeaders: unsafeHeaders
  };
}
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


    const mapping =
  mappings[header];

const mappedLabel =
  typeof mapping === "object" &&
  mapping !== null
    ? mapping.label
    : mapping;

const mappedStandard =
  typeof mapping === "object" &&
  mapping !== null
    ? mapping.standard
    : "";

results.push({
  question:
    header,

  label:
    mappedLabel ||
    header,

  standard:
    mappedStandard ||
    "",

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

const mappingHeaders =
  safeHeaders.filter(
    header =>
      String(header)
        .trim()
        .toLowerCase() !==
      "alias"
  );

standardMapping.innerHTML =
  mappingHeaders
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

    <div class="mapping-field">
      <label>
        Skill / Objective
      </label>

      <input
        type="text"
        class="skill-input"
        data-question="${header}"
        placeholder="Example: Camera Angles"
      >
    </div>

    <div class="mapping-field">
      <label>
        Standard / TEKS
      </label>

      <input
        type="text"
        class="standard-input"
        data-question="${header}"
        placeholder="Example: TEKS 117.315"
      >
    </div>

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

  const skillInputs =
    document.querySelectorAll(
      ".skill-input"
    );

  const mappings = {};

  skillInputs.forEach(
    input => {

      const question =
        input.dataset.question;

      const label =
        input.value.trim();

      const standardInput =
        document.querySelector(
          `.standard-input[data-question="${question}"]`
        );

      const standard =
        standardInput
          ? standardInput.value.trim()
          : "";

      mappings[question] = {
        label:
          label ||
          question,

        standard:
          standard
      };

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
  function (event) {
    if (!event.target) {
      return;
    }

    if (
      event.target.id ===
      "generateAliasesButton"
    ) {
      generatePrivacyAliases();
    }

    if (
      event.target.id ===
      "copyAliasesButton"
    ) {
      copyGeneratedAliases();
    }

    if (
      event.target.id ===
      "copyDataActionBriefButton"
    ) {
      copyDataActionBrief();
    }
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
  ),

thanksgivingBreakDate:
  document
    .getElementById(
      "thanksgivingBreakDate"
    )
    .value,

winterBreakDate:
  document
    .getElementById(
      "winterBreakDate"
    )
    .value,

springBreakDate:
  document
    .getElementById(
      "springBreakDate"
    )
    .value,

summerBreakDate:
  document
    .getElementById(
      "summerBreakDate"
    )
    .value

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
renderBreakCountdowns();
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

  document
  .getElementById(
    "thanksgivingBreakDate"
  )
  .value =
    settings.thanksgivingBreakDate
    || "";


document
  .getElementById(
    "winterBreakDate"
  )
  .value =
    settings.winterBreakDate
    || "";


document
  .getElementById(
    "springBreakDate"
  )
  .value =
    settings.springBreakDate
    || "";


document
  .getElementById(
    "summerBreakDate"
  )
  .value =
    settings.summerBreakDate
    || "";

  applyTeacherSettings(
    settings
  );

}
/*
==============================================
APPLY TEACHER SETTINGS
==============================================
*/

const thanksgivingBreakDate =
  document.getElementById(
    "thanksgivingBreakDate"
  );


const winterBreakDate =
  document.getElementById(
    "winterBreakDate"
  );


const springBreakDate =
  document.getElementById(
    "springBreakDate"
  );


const summerBreakDate =
  document.getElementById(
    "summerBreakDate"
  );
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
if (
  thanksgivingBreakDate
) {

  thanksgivingBreakDate.value =
    settings.thanksgivingBreakDate
    || "";

}


if (
  winterBreakDate
) {

  winterBreakDate.value =
    settings.winterBreakDate
    || "";

}


if (
  springBreakDate
) {

  springBreakDate.value =
    settings.springBreakDate
    || "";

}


if (
  summerBreakDate
) {

  summerBreakDate.value =
    settings.summerBreakDate
    || "";

}
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
PLC HISTORY
==============================================
*/


const plcMeetingDate =
  document.getElementById(
    "plcMeetingDate"
  );


const savePlcButton =
  document.getElementById(
    "savePlcButton"
  );


const plcSavedMessage =
  document.getElementById(
    "plcSavedMessage"
  );


const plcHistoryStorageKey =
  "teachAGeniusPlcHistory";

const plcPreviousMeeting =
  document.getElementById(
    "plcPreviousMeeting"
  );


const plcPreviousMeetingReference =
  document.getElementById(
    "plcPreviousMeetingReference"
  );


const plcPreviousMeetingDate =
  document.getElementById(
    "plcPreviousMeetingDate"
  );


const bringForwardPlcButton =
  document.getElementById(
    "bringForwardPlcButton"
  );


const bringForwardPlcMessage =
  document.getElementById(
    "bringForwardPlcMessage"
  );

function getPlcHistory() {

  const savedHistory =
    localStorage.getItem(
      plcHistoryStorageKey
    );


  if (
    !savedHistory
  ) {

    return [];

  }


  try {

    return JSON.parse(
      savedHistory
    );

  } catch (
    error
  ) {

    console.error(
      "Could not read PLC history:",
      error
    );

    return [];

  }

}

function formatPlcDate(
  dateString
) {

  if (
    !dateString
  ) {

    return "Date unavailable";

  }


  const date =
    new Date(
      `${dateString}T00:00:00`
    );


  return date.toLocaleDateString(
    "en-US",
    {
      month:
        "long",

      day:
        "numeric",

      year:
        "numeric"
    }
  );

}


function populatePreviousPlcOptions() {

  if (
    !plcPreviousMeeting
  ) {

    return;

  }


  const plcHistory =
    getPlcHistory();


  plcPreviousMeeting.innerHTML =
    `
      <option value="">
        Select a previous PLC
      </option>
    `;


  const sortedHistory =
    [...plcHistory]
      .sort(
        (
          firstRecord,
          secondRecord
        ) => {

          return (
            new Date(
              secondRecord.meetingDate
            ) -
            new Date(
              firstRecord.meetingDate
            )
          );

        }
      );


  sortedHistory.forEach(
    record => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        record.id;


      option.textContent =
        `${formatPlcDate(
          record.meetingDate
        )} — ${
          record.course ||
          "Course not listed"
        }`;


      plcPreviousMeeting.appendChild(
        option
      );

    }
  );

}

function getSelectedPreviousPlc() {

  if (
    !plcPreviousMeeting ||
    !plcPreviousMeeting.value
  ) {

    return null;

  }


  const plcHistory =
    getPlcHistory();


  return (
    plcHistory.find(
      record =>
        record.id ===
        plcPreviousMeeting.value
    ) ||
    null
  );

}

function updatePreviousPlcReference() {

  const previousPlc =
    getSelectedPreviousPlc();


  if (
    !previousPlc
  ) {

    if (
      plcPreviousMeetingReference
    ) {

      plcPreviousMeetingReference
        .classList
        .add(
          "hidden"
        );

    }

    return;

  }


  if (
    plcPreviousMeetingDate
  ) {

    plcPreviousMeetingDate.textContent =
      formatPlcDate(
        previousPlc.meetingDate
      );

  }


  if (
    plcPreviousMeetingReference
  ) {

    plcPreviousMeetingReference
      .classList
      .remove(
        "hidden"
      );

  }

}




function getPlcFieldValue(
  fieldId
) {

  const field =
    document.getElementById(
      fieldId
    );


  return field
    ? field.value.trim()
    : "";

}


function getPlcNumberValue(
  fieldId
) {

  const field =
    document.getElementById(
      fieldId
    );


  if (
    !field ||
    field.value === ""
  ) {

    return null;

  }


  return Number(
    field.value
  );

}

function setPlcFieldValue(
  fieldId,
  value
) {

  const field =
    document.getElementById(
      fieldId
    );


  if (
    !field
  ) {

    return;

  }


  field.value =
    value ?? "";

}

function buildPlcRecord() {

  return {

    id:
      `plc-${Date.now()}`,

    meetingDate:
      getPlcFieldValue(
        "plcMeetingDate"
      ),

    savedAt:
      new Date()
        .toISOString(),

    course:
      getPlcFieldValue(
        "plcCourse"
      ),

    grades:
      getPlcFieldValue(
        "plcGrades"
      ),

    instructionalFocus:
      getPlcFieldValue(
        "plcInstructionalFocus"
      ),

    learningObjective:
      getPlcFieldValue(
        "plcLearningObjective"
      ),

    dol:
      getPlcFieldValue(
        "plcDol"
      ),

    studentStruggle:
      getPlcFieldValue(
        "plcStudentStruggle"
      ),

    whatWorked:
      getPlcFieldValue(
        "plcWhatWorked"
      ),

    mastered:
      getPlcNumberValue(
        "plcMastered"
      ),

    meets:
      getPlcNumberValue(
        "plcMeets"
      ),

    approaching:
      getPlcNumberValue(
        "plcApproaching"
      ),

    below:
      getPlcNumberValue(
        "plcBelow"
      ),

    nextWeekPlan:
      getPlcFieldValue(
        "plcNextWeekPlan"
      ),

    supportNeeded:
      getPlcFieldValue(
        "plcSupportNeeded"
      ),

    glow:
      getPlcFieldValue(
        "plcGlow"
      ),

    additionalNotes:
      getPlcFieldValue(
        "plcAdditionalNotes"
      )

  };

}





function savePlcRecord() {

  const plcRecord =
    buildPlcRecord();


  if (
    !plcRecord.meetingDate
  ) {

    alert(
      "Add the PLC meeting date before saving."
    );

    return;

  }


  const plcHistory =
    getPlcHistory();


  plcHistory.push(
    plcRecord
  );


  localStorage.setItem(
    plcHistoryStorageKey,
    JSON.stringify(
      plcHistory
    )
  );


  console.log(
    "PLC saved:",
    plcRecord
  );


  console.log(
    "PLC history:",
    plcHistory
  );


  if (
    plcSavedMessage
  ) {

    plcSavedMessage
      .classList
      .remove(
        "hidden"
      );

  }

}


if (
  savePlcButton
) {

  savePlcButton
    .addEventListener(
      "click",
      savePlcRecord
    );

}



function bringForwardSelectedPlc() {

  const previousPlc =
    getSelectedPreviousPlc();


  if (
    !previousPlc
  ) {

    alert(
      "Select a previous PLC meeting first."
    );

    return;

  }


  setPlcFieldValue(
    "plcCourse",
    previousPlc.course
  );


  setPlcFieldValue(
    "plcGrades",
    previousPlc.grades
  );


  setPlcFieldValue(
    "plcInstructionalFocus",
    previousPlc.instructionalFocus
  );


  setPlcFieldValue(
    "plcLearningObjective",
    previousPlc.learningObjective
  );


  setPlcFieldValue(
    "plcDol",
    previousPlc.dol
  );


  if (
    bringForwardPlcMessage
  ) {

    bringForwardPlcMessage
      .classList
      .remove(
        "hidden"
      );

  }

}


if (
  plcPreviousMeeting
) {

  plcPreviousMeeting
    .addEventListener(
      "change",
      updatePreviousPlcReference
    );

}


if (
  bringForwardPlcButton
) {

  bringForwardPlcButton
    .addEventListener(
      "click",
      bringForwardSelectedPlc
    );

}


populatePreviousPlcOptions();

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
/*
==============================================
SEMESTER / YAG ENGINE
==============================================
*/


const addSemesterUnitButton =
  document.getElementById(
    "addSemesterUnitButton"
  );


const buildSemesterMapButton =
  document.getElementById(
    "buildSemesterMapButton"
  );



addSemesterUnitButton
  .addEventListener(
    "click",
    addSemesterUnitRow
  );



function addSemesterUnitRow(
  unitName = "",
  meetings = 5
) {

  const container =
    document.getElementById(
      "semesterUnitRows"
    );


  const row =
    document.createElement(
      "div"
    );


  row.className =
    "semester-unit-row";


  row.innerHTML = `

    <input
      type="text"
      class="semester-unit-name"
      placeholder="Unit title"
      value="${unitName}"
    >


    <input
      type="number"
      class="semester-unit-meetings"
      min="1"
      value="${meetings}"
    >


    <button
      type="button"
      class="remove-row-button"
      title="Remove unit"
    >
      ×
    </button>

  `;


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


  container.appendChild(
    row
  );

}
function getSemesterUnits() {

  const rows =
    document.querySelectorAll(
      ".semester-unit-row"
    );


  const units = [];


  rows.forEach(
    row => {

      const name =
        row
          .querySelector(
            ".semester-unit-name"
          )
          .value
          .trim();


      const meetings =
        Number(
          row
            .querySelector(
              ".semester-unit-meetings"
            )
            .value
        );


      if (
        name
        &&
        Number.isFinite(
          meetings
        )
        &&
        meetings > 0
      ) {

        units.push({

          name:
            name,

          meetings:
            meetings

        });

      }

    }
  );


  return units;

}
function countWeekdays(
  startDate,
  endDate
) {

  const start =
    new Date(
      startDate
      + "T12:00:00"
    );


  const end =
    new Date(
      endDate
      + "T12:00:00"
    );


  let count = 0;


  const current =
    new Date(
      start
    );


  while (
    current <= end
  ) {

    const day =
      current.getDay();


    if (
      day !== 0
      &&
      day !== 6
    ) {

      count++;

    }


    current.setDate(
      current.getDate()
      + 1
    );

  }


  return count;

}
function calculateAvailableMeetings(
  startDate,
  endDate,
  schedule,
  rotation,
  interruptions
) {

  const blockedDates =
    new Set(
      interruptions.map(
        item =>
          item.date
      )
    );


  const start =
    new Date(
      startDate
      + "T12:00:00"
    );


  const end =
    new Date(
      endDate
      + "T12:00:00"
    );


  let instructionalDayIndex = 0;

  let meetingCount = 0;


  const current =
    new Date(
      start
    );


  while (
    current <= end
  ) {

    const dayOfWeek =
      current.getDay();


    const dateString =
      formatLocalDateKey(
        current
      );


    const isWeekday =
      dayOfWeek !== 0
      &&
      dayOfWeek !== 6;


    const isBlocked =
      blockedDates.has(
        dateString
      );


    if (
      isWeekday
      &&
      !isBlocked
    ) {

      if (
        schedule === "daily"
        ||
        rotation === "every"
      ) {

        meetingCount++;

      }

      else if (
        schedule === "ab"
      ) {

        const currentRotation =
          instructionalDayIndex % 2 === 0
            ? "a"
            : "b";


        if (
          currentRotation ===
          rotation
        ) {

          meetingCount++;

        }

      }


      instructionalDayIndex++;

    }


    current.setDate(
      current.getDate()
      + 1
    );

  }


  return meetingCount;

}
function calculateExpectedMeetingsToToday(
  startDate,
  endDate,
  schedule,
  rotation,
  interruptions
) {

  if (
    !startDate
    ||
    !endDate
  ) {

    return 0;

  }


  const today =
    new Date();


  today.setHours(
    12,
    0,
    0,
    0
  );


  const semesterStart =
    new Date(
      startDate
      + "T12:00:00"
    );


  const semesterEnd =
    new Date(
      endDate
      + "T12:00:00"
    );


  if (
    today < semesterStart
  ) {

    return 0;

  }


  let pacingEnd =
    today;


  if (
    today > semesterEnd
  ) {

    pacingEnd =
      semesterEnd;

  }


  const pacingEndKey =
    formatLocalDateKey(
      pacingEnd
    );


  return calculateAvailableMeetings(
    startDate,
    pacingEndKey,
    schedule,
    rotation,
    interruptions
  );

}
function formatLocalDateKey(
  date
) {

  const year =
    date.getFullYear();


  const month =
    String(
      date.getMonth() + 1
    )
    .padStart(
      2,
      "0"
    );


  const day =
    String(
      date.getDate()
    )
    .padStart(
      2,
      "0"
    );


  return (
    year
    + "-"
    + month
    + "-"
    + day
  );

}
  
buildSemesterMapButton
  .addEventListener(
    "click",
    buildSemesterMap
  );



function buildSemesterMap() {

  const startDate =
    document
      .getElementById(
        "semesterStart"
      )
      .value;


  const endDate =
    document
      .getElementById(
        "semesterEnd"
      )
      .value;


  const schedule =
    document
      .getElementById(
        "semesterSchedule"
      )
      .value;


  const rotation =
    document
      .getElementById(
        "courseRotation"
      )
      .value;


  const units =
    getSemesterUnits();
const interruptions =
  getCalendarInterruptions();

  if (
    !startDate
    ||
    !endDate
  ) {

    alert(
      "Enter the semester start and end dates."
    );

    return;

  }


  if (
    new Date(startDate)
    >
    new Date(endDate)
  ) {

    alert(
      "Semester end date must come after the start date."
    );

    return;

  }


  if (
    units.length === 0
  ) {

    alert(
      "Add at least one unit."
    );

    return;

  }


  const availableMeetings =
  calculateAvailableMeetings(
    startDate,
    endDate,
    schedule,
    rotation,
    interruptions
  );


  const requiredMeetings =
    units.reduce(
      (
        total,
        unit
      ) =>
        total + unit.meetings,
      0
    );


  displaySemesterMap({

    startDate:
      startDate,

    endDate:
      endDate,

    availableMeetings:
      availableMeetings,

    requiredMeetings:
      requiredMeetings,
    
interruptions:
  interruptions,
    
    units:
      units

  });

}
function displaySemesterMap(
  map
) {

  const results =
    document.getElementById(
      "semesterMapResults"
    );


  let runningMeeting = 1;


  const unitCards =
    map.units
      .map(
        unit => {

          const startMeeting =
            runningMeeting;


          const endMeeting =
            runningMeeting
            +
            unit.meetings
            -
            1;


          runningMeeting =
            endMeeting + 1;


          return `

            <div class="semester-unit-card">

              <strong>
                ${unit.name}
              </strong>

              ${unit.meetings}
              instructional meeting(s)

              <br>

              Planned sequence:
              Meeting ${startMeeting}
              →
              Meeting ${endMeeting}

            </div>

          `;

        }
      )
      .join("");


  let capacityMessage = "";


  const difference =
    map.availableMeetings
    -
    map.requiredMeetings;


  if (
    difference < 0
  ) {

    capacityMessage = `

      <div class="semester-warning">

        Your current plan requires
        ${Math.abs(difference)}
        more instructional meeting(s)
        than this schedule currently provides.

        Something has to move, combine,
        or be shortened.

      </div>

    `;

  }

  else {

    capacityMessage = `

      <div class="semester-summary">

        You currently have approximately
        ${difference}
        unallocated instructional meeting(s).

        These can eventually be reserved
        for reteach, testing, projects,
        interruptions, or schedule changes.

      </div>

    `;

  }


  results.innerHTML = `

    <div class="semester-summary">

      <strong>
        Planning Window
      </strong>

      <br>

      ${map.startDate}
      →
      ${map.endDate}

      <br><br>

      Approximate available meetings:
      <strong>
        ${map.availableMeetings}
      </strong>

      <br>

      Meetings currently planned:
      <strong>
        ${map.requiredMeetings}
      </strong>
<br>

Calendar interruptions entered:
<strong>
  ${map.interruptions.length}
</strong>
    </div>


    ${unitCards}


    ${capacityMessage}

  `;


  results
    .classList
    .remove(
      "hidden"
    );

}
addSemesterUnitRow(
  "",
  5
);


addSemesterUnitRow(
  "",
  5
);


addSemesterUnitRow(
  "",
  5
);
/*
==============================================
CALENDAR REALITY ENGINE
==============================================
*/


const addInterruptionButton =
  document.getElementById(
    "addInterruptionButton"
  );



addInterruptionButton
  .addEventListener(
    "click",
    addCalendarInterruptionRow
  );



function addCalendarInterruptionRow() {

  const container =
    document.getElementById(
      "calendarInterruptionRows"
    );


  const row =
    document.createElement(
      "div"
    );


  row.className =
    "calendar-interruption-row";


  row.innerHTML = `

    <select class="interruption-type">

      <option value="holiday">
        Holiday
      </option>

      <option value="thanksgiving">
        Thanksgiving Break
      </option>

      <option value="winter">
        Winter Break
      </option>

      <option value="spring">
        Spring Break
      </option>

      <option value="pd">
        Professional Development
      </option>

      <option value="testing">
        Testing / No Regular Class
      </option>

      <option value="fieldtrip">
        Field Trip
      </option>

      <option value="campus">
        Campus Event
      </option>

      <option value="closure">
        School Closure
      </option>

      <option value="other">
        Other
      </option>

    </select>


    <input
      type="date"
      class="interruption-date"
    >


    <input
      type="text"
      class="interruption-note"
      placeholder="Optional note"
    >
    <button
  type="button"
  class="calendar-add-button secondary-button"
>
  Add to Google Calendar
</button>


    <button
      type="button"
      class="remove-row-button"
      title="Remove interruption"
    >
      Remove
    </button>

  `;
const calendarButton =
  row.querySelector(
    ".calendar-add-button"
  );


if (
  calendarButton
) {

  calendarButton
    .addEventListener(
      "click",
      function () {

        addCalendarInterruptionToGoogle(
          row
        );

      }
    );

}

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


  container.appendChild(
    row
  );

}
function getCalendarInterruptions() {

  const rows =
    document.querySelectorAll(
      ".calendar-interruption-row"
    );


  const interruptions = [];


  rows.forEach(
    row => {

      const type =
        row
          .querySelector(
            ".interruption-type"
          )
          .value;


      const date =
        row
          .querySelector(
            ".interruption-date"
          )
          .value;


      const note =
        row
          .querySelector(
            ".interruption-note"
          )
          .value
          .trim();
      


      if (
        date
      ) {

        interruptions.push({

          type:
            type,

          date:
            date,

          note:
            note
            

        
        });

      }

    }
  );


  return interruptions;

}
// Deployment refresh
/*
==============================================
BREAK COUNTDOWN ENGINE
==============================================
*/


function countSchoolDaysUntil(
  targetDate
) {

  if (
    !targetDate
  ) {

    return null;

  }


  const today =
    new Date();


  today.setHours(
    12,
    0,
    0,
    0
  );


  const target =
    new Date(
      targetDate
      + "T12:00:00"
    );


  if (
    target < today
  ) {

    return 0;

  }


  let schoolDays = 0;


  const current =
    new Date(
      today
    );


  while (
    current < target
  ) {

    current.setDate(
      current.getDate()
      + 1
    );


    const day =
      current.getDay();


    const isWeekday =
      day !== 0
      &&
      day !== 6;


    if (
      isWeekday
    ) {

      schoolDays++;

    }

  }


  return schoolDays;

}
function getBreakCountdownData(
  settings
) {

  return [

    {
      label:
        "🍂 Thanksgiving Break",

      date:
        settings.thanksgivingBreakDate
    },

    {
      label:
        "❄️ Winter Break",

      date:
        settings.winterBreakDate
    },

    {
      label:
        "🌸 Spring Break",

      date:
        settings.springBreakDate
    },

    {
      label:
        "☀️ Summer Break",

      date:
        settings.summerBreakDate
    }

  ];

}
function renderBreakCountdowns() {

  const container =
    document.getElementById(
      "breakCountdownCards"
    );


  if (
    !container
  ) {

    return;

  }


  const savedSettings =
    localStorage.getItem(
      "teachAGeniusSettings"
    );


  if (
    !savedSettings
  ) {

    container.innerHTML = `

      <div class="break-countdown-empty">

        Add your break dates in Teacher Settings
        to start the countdown.

      </div>

    `;

    return;

  }


  const settings =
    JSON.parse(
      savedSettings
    );


  const breaks =
    getBreakCountdownData(
      settings
    );


  const activeBreaks =
    breaks.filter(
      item =>
        item.date
    );


  if (
    activeBreaks.length === 0
  ) {

    container.innerHTML = `

      <div class="break-countdown-empty">

        Add your break dates in Teacher Settings
        to start the countdown.

      </div>

    `;

    return;

  }


  container.innerHTML =
    activeBreaks
      .map(
        item => {

          const schoolDays =
            countSchoolDaysUntil(
              item.date
            );


          const dayWord =
            schoolDays === 1
              ? "school day"
              : "school days";


          return `

            <div class="break-countdown-card">

              <span>
                ${item.label}
              </span>

              <strong>
                ${schoolDays}
              </strong>

              <p>
                ${dayWord} remaining
              </p>

            </div>

          `;

        }
      )
      .join("");

}
renderBreakCountdowns();
/*
==============================================
GOOGLE CALENDAR REMINDER BRIDGE
==============================================
*/


const sendCalendarRemindersButton =
  document.getElementById(
    "sendCalendarRemindersButton"
  );



if (
  sendCalendarRemindersButton
) {

  sendCalendarRemindersButton
    .addEventListener(
      "click",
      sendCalendarRemindersToGoogle
    );

}
function getReminderMinutes(
  reminder
) {

  const reminderMap = {

    "1day":
      1440,

    "3days":
      4320,

    "7days":
      10080

  };


  return reminderMap[
    reminder
  ]
  || null;

}
function buildCalendarReminderPayload() {

  const interruptions =
    getCalendarInterruptions();


  const selected =
    interruptions.filter(
      item =>
        item.reminder !== "none"
    );


  return selected.map(
    item => {

      return {

        title:
          getCalendarEventTitle(
            item.type,
            item.note
          ),

        date:
          item.date,

        reminderMinutes:
          getReminderMinutes(
            item.reminder
          )

      };

    }
  );

}
function getCalendarEventTitle(
  type,
  note
) {

  const labels = {

    holiday:
      "Holiday",

    thanksgiving:
      "Thanksgiving Break",

    winter:
      "Winter Break",

    spring:
      "Spring Break",

    pd:
      "Professional Development",

    testing:
      "Testing / No Regular Class",

    fieldtrip:
      "Field Trip",

    campus:
      "Campus Event",

    closure:
      "School Closure",

    other:
      "School Calendar Reminder"

  };


  const baseTitle =
    labels[type]
    || "School Calendar Reminder";


  if (
    note
  ) {

    return (
      baseTitle
      + " — "
      + note
    );

  }


  return baseTitle;

}
const GOOGLE_CALENDAR_BRIDGE_URL =
  "https://script.google.com/macros/s/AKfycbyaFVf9DqQM2Lv2Dw7ueTMMV7gfstaDVoG34s0vMAGrujOfyFuf7sdEqSc3EetVle0a/exec";
async function sendCalendarRemindersToGoogle() {

  const events =
    buildCalendarReminderPayload();


  if (
    events.length === 0
  ) {

    alert(
      "Choose at least one calendar reminder first."
    );

    return;

  }


  if (
    GOOGLE_CALENDAR_BRIDGE_URL
    ===
    "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE"
  ) {

    alert(
      "Google Calendar connection is not configured yet."
    );

    return;

  }


  try {

    const response =
      await fetch(
        GOOGLE_CALENDAR_BRIDGE_URL,
        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "text/plain;charset=utf-8"

          },

          body:
            JSON.stringify({
              events:
                events
            })

        }
      );


    const result =
      await response.json();


    if (
      !result.ok
    ) {

      throw new Error(
        result.error
        ||
        "Google Calendar request failed."
      );

    }


    alert(
      result.created
      +
      " reminder(s) added to Google Calendar."
    );

  }

  catch (
    error
  ) {

    console.error(
      error
    );


    alert(
      "Google Calendar connection failed. Check the bridge setup."
    );

  }

}
/*
==============================================
SMART GOOGLE CALENDAR LINK ENGINE
==============================================
*/


function buildGoogleCalendarUrl(
  eventData
) {

  const baseUrl =
    "https://calendar.google.com/calendar/render";


  const startDate =
    formatGoogleCalendarDate(
      eventData.date
    );


  const endDate =
    formatGoogleCalendarDate(
      getNextCalendarDate(
        eventData.date
      )
    );


  const params =
    new URLSearchParams({

      action:
        "TEMPLATE",

      text:
        eventData.title,

      dates:
        startDate
        + "/"
        + endDate,

      details:
        eventData.details
        || "Added from TeachAGenius"

    });


  return (
    baseUrl
    + "?"
    + params.toString()
  );

}
function formatGoogleCalendarDate(
  dateString
) {

  return dateString
    .replaceAll(
      "-",
      ""
    );

}
function getNextCalendarDate(
  dateString
) {

  const date =
    new Date(
      dateString
      + "T12:00:00"
    );


  date.setDate(
    date.getDate()
    + 1
  );


  return formatLocalDateKey(
    date
  );

}


function addCalendarInterruptionToGoogle(
  row
) {

  const type =
    row
      .querySelector(
        ".interruption-type"
      )
      .value;


  const date =
    row
      .querySelector(
        ".interruption-date"
      )
      .value;


  const note =
    row
      .querySelector(
        ".interruption-note"
      )
      .value
      .trim();


  if (
    !date
  ) {

    alert(
      "Add a date before sending this event to Google Calendar."
    );

    return;

  }


  const eventData = {

    title:
      getCalendarEventTitle(
        type,
        note
      ),

    date:
      date,

    details:
      "School calendar event added from TeachAGenius."

  };


  const googleUrl =
    buildGoogleCalendarUrl(
      eventData
    );


  window.open(
    googleUrl,
    "_blank"
  );

}
/*
==============================================
PACING INTELLIGENCE ENGINE
==============================================
*/
function getPacingStatus(
  expectedMeetings,
  actualMeetings
) {

  const difference =
    actualMeetings
    -
    expectedMeetings;


  if (
    difference === 0
  ) {

    return {

      difference:
        0,

      status:
        "On pace",

      message:
        "Your actual instructional progress matches the current calendar pace."

    };

  }


  if (
    difference > 0
  ) {

    return {

      difference:
        difference,

      status:
        "Ahead of pace",

      message:
        "You are approximately "
        + difference
        + " instructional meeting"
        + (
          difference === 1
            ? ""
            : "s"
        )
        + " ahead of the current calendar pace."

    };

  }


  const meetingsBehind =
    Math.abs(
      difference
    );


  return {

    difference:
      difference,

    status:
      "Pacing adjustment needed",

    message:
      "You are approximately "
      + meetingsBehind
      + " instructional meeting"
      + (
        meetingsBehind === 1
          ? ""
          : "s"
      )
      + " behind the current calendar pace."

  };

}
function getPacingPriority(
  expectedMeetings,
  actualMeetings
) {

  const gap =
    expectedMeetings
    -
    actualMeetings;


  if (
    gap <= 0
  ) {

    return {

      level:
        "stable",

      label:
        "Pacing is stable",

      message:
        "No pacing recovery is currently needed."

    };

  }


  if (
    gap <= 2
  ) {

    return {

      level:
        "watch",

      label:
        "Monitor pacing",

      message:
        "A small pacing gap exists. Protect upcoming instructional time before compressing content."

    };

  }


  if (
    gap <= 5
  ) {

    return {

      level:
        "adjust",

      label:
        "Pacing adjustment needed",

      message:
        "A moderate pacing gap exists. Review upcoming lessons for instructional time that can be recovered without removing essential learning."

    };

  }


  return {

    level:
      "priority",

    label:
      "Pacing recovery priority",

    message:
      "A significant pacing gap exists. Use mastery evidence before deciding what to reteach, combine, extend, or move forward from."

  };

}
function getCurrentMasterySummary() {
  if (
    !Array.isArray(currentMasteryStats) ||
    currentMasteryStats.length === 0
  ) {
    return null;
  }

  const validStats =
    currentMasteryStats.filter(
      item =>
        typeof item.average === "number" &&
        Number.isFinite(item.average)
    );

  if (validStats.length === 0) {
    return null;
  }

  const sortedStats =
    [...validStats].sort(
      (a, b) => a.average - b.average
    );

  return {
    lowest: sortedStats[0],
    highest:
      sortedStats[sortedStats.length - 1]
  };
}
function getInstructionalGuidance(
  expectedMeetings,
  actualMeetings,
  masterySummary
) {
  if (!masterySummary) {
    return {
      title: "Mastery evidence needed",
      message:
        "Run a privacy-safe Mastery analysis before making pacing recovery decisions."
    };
  }

  const pacingGap =
    expectedMeetings - actualMeetings;

  const lowest =
    masterySummary.lowest;

  const highest =
    masterySummary.highest;

  if (pacingGap <= 0) {
    return {
      title: "Maintain instructional pace",
      message:
        `${lowest.label} is currently the lowest mastery area at ${Math.round(lowest.average)}%. ` +
        `Continue monitoring it while maintaining pace.`
    };
  }

  if (pacingGap <= 2) {
    return {
      title: "Monitor before adjusting",
      message:
        `${lowest.label} is the current lowest mastery area at ${Math.round(lowest.average)}%. ` +
        `Use targeted checks before making a larger pacing adjustment.`
    };
  }

  if (pacingGap <= 5) {
    return {
      title: "Target instructional time",
      message:
        `Consider protecting instructional time for ${lowest.label} at ${Math.round(lowest.average)}% mastery. ` +
        `${highest.label} is currently stronger at ${Math.round(highest.average)}% and may need less whole-group recovery time.`
    };
  }

  return {
    title: "Prioritize recovery with mastery evidence",
    message:
      `A significant pacing gap exists. ${lowest.label} is currently the lowest mastery area at ${Math.round(lowest.average)}%. ` +
      `${highest.label} is currently strongest at ${Math.round(highest.average)}%. ` +
      `Use this evidence to decide what may need reteaching, targeted support, compression, extension, or continued monitoring.`
  };
}
function getReteachTarget(masterySummary) {
  if (!masterySummary) {
    return null;
  }

  const target =
    masterySummary.lowest;

  let response =
    "Monitor and use targeted CFUs.";

  if (target.average < 60) {
    response =
      "Reteach this skill with focused whole-group or small-group support.";
  } else if (target.average < 75) {
    response =
      "Use targeted small-group support and additional guided practice.";
  }

return {
  question:
    target.question,

  label:
    target.label,

  standard:
    target.standard || "",

  average:
    target.average,

  response:
    response
};
}
function getDataActionBrief(
  expectedMeetings,
  actualMeetings,
  masterySummary
) {
  const reteachTarget =
    getReteachTarget(
      masterySummary
    );

  if (!reteachTarget) {
    return null;
  }

  const pacingGap =
    expectedMeetings -
    actualMeetings;

  const pacingText =
    pacingGap > 0
      ? `${pacingGap} instructional meetings behind expected pace`
      : pacingGap < 0
        ? `${Math.abs(pacingGap)} instructional meetings ahead of expected pace`
        : "on expected instructional pace";

  return {
  reteachTarget:
  reteachTarget.label,

sourceQuestion:
  reteachTarget.question,
    
standard:
  reteachTarget.standard,
    
mastery:
  Math.round(
    reteachTarget.average
  ),

    pacing:
      pacingText,

    response:
      reteachTarget.response,

    evidence:
      "Use a focused CFU or DOL after support to measure whether mastery improves."
  };
}
function formatDataActionBrief(
  dataActionBrief
) {
  if (!dataActionBrief) {
    return "";
  }

  return [
    "DATA ACTION BRIEF",
    "",
    `Reteach Focus: ${dataActionBrief.reteachTarget}`,
    `Current Mastery: ${dataActionBrief.mastery}%`,
    `Pacing Context: ${dataActionBrief.pacing}`,
    "",
    `Instructional Response: ${dataActionBrief.response}`,
    "",
    `Evidence to Collect: ${dataActionBrief.evidence}`
  ].join("\n");
}
function formatDataActionBrief(
  dataActionBrief
) {
  if (!dataActionBrief) {
    return "";
  }
const standardLine =
  dataActionBrief.standard
    ? `Standard: ${dataActionBrief.standard}`
    : "";
 const sourceLine =
  dataActionBrief.sourceQuestion &&
  dataActionBrief.sourceQuestion !==
    dataActionBrief.reteachTarget
    ? `Assessment Source: ${dataActionBrief.sourceQuestion}`
    : "";

return [
  "DATA ACTION BRIEF",
  "",
  `Reteach Focus: ${dataActionBrief.reteachTarget}`,
  standardLine,
  sourceLine,
  `Current Mastery: ${dataActionBrief.mastery}%`,
  `Pacing Context: ${dataActionBrief.pacing}`,
  "",
  `Instructional Response: ${dataActionBrief.response}`,
  "",
  `Evidence to Collect: ${dataActionBrief.evidence}`
]
  .filter(line => line !== "")
  .join("\n");
}
function getUnitPositionFromMeeting(
  meetingNumber,
  units
) {

  if (
    !Array.isArray(units)
    ||
    units.length === 0
  ) {

    return null;

  }


  if (
    meetingNumber <= 0
  ) {

    return {

      unitTitle:
        units[0].title,

      unitNumber:
        1,

      meetingInUnit:
        0,

      unitMeetings:
        Number(
          units[0].meetings
        )

    };

  }


  let runningTotal =
    0;


  for (
    let index = 0;
    index < units.length;
    index++
  ) {

    const unit =
      units[index];


    const unitMeetings =
      Number(
        unit.meetings
      );
if (
  !Number.isFinite(
    unitMeetings
  )
  ||
  unitMeetings <= 0
) {

  continue;

}

    const unitStart =
      runningTotal
      + 1;


    const unitEnd =
      runningTotal
      + unitMeetings;


    if (
      meetingNumber >= unitStart
      &&
      meetingNumber <= unitEnd
    ) {

      return {

        unitTitle:
          unit.title
          ||
          "Unit "
          + (
            index + 1
          ),

        unitNumber:
          index + 1,

        meetingInUnit:
          meetingNumber
          -
          runningTotal,

        unitMeetings:
          unitMeetings

      };

    }


    runningTotal +=
      unitMeetings;

  }


  return {

    unitTitle:
      "Beyond Planned Units",

    unitNumber:
      units.length + 1,

    meetingInUnit:
      meetingNumber
      -
      runningTotal,

    unitMeetings:
      0

  };

}
function displayPacingResults(
  expectedMeetings,
  actualMeetings,
  expectedUnitPosition,
  actualUnitPosition
) {

  const results =
    document.getElementById(
      "pacingCheckResults"
    );


  if (
    !results
  ) {

    return;

  }

  
  const pacing =
    getPacingStatus(
      expectedMeetings,
      actualMeetings
    );
const pacingPriority =
  getPacingPriority(
    expectedMeetings,
    actualMeetings
  );
const masterySummary =
  getCurrentMasterySummary();
  results.classList.remove(
    "hidden"
  );
const instructionalGuidance =
  getInstructionalGuidance(
    expectedMeetings,
    actualMeetings,
    masterySummary
  );
const dataActionBrief =
  getDataActionBrief(
    expectedMeetings,
    actualMeetings,
    masterySummary
  );  
  currentDataActionBrief =
  dataActionBrief;
  results.innerHTML = `

    <div class="pacing-status">
      ${pacing.status}
    </div>


    <div class="pacing-detail">

      Expected instructional meetings
      completed by today:

      <div class="pacing-number">
        ${expectedMeetings}
      </div>

    </div>


    <div class="pacing-detail">

      Your reported instructional
      meetings completed:

      <div class="pacing-number">
        ${actualMeetings}
      </div>

    </div>


    <div class="pacing-detail">
      ${pacing.message}
    </div>
    <div class="pacing-priority-card">

  <span class="eyebrow">
    Instructional Priority
  </span>

  <h4>
    ${pacingPriority.label}
  </h4>

  <p>
    ${pacingPriority.message}
  </p>

</div>
${
  masterySummary
    ? `
      <div class="pacing-priority-card">
        <h4>Mastery Signal</h4>

        <p>
          Lowest current mastery:
          <strong>
            ${masterySummary.lowest.label}
            — ${Math.round(
              masterySummary.lowest.average
            )}%
          </strong>
        </p>

        <p>
          Strongest current mastery:
          <strong>
            ${masterySummary.highest.label}
            — ${Math.round(
              masterySummary.highest.average
            )}%
          </strong>
        </p>
      </div>
    `
    : `
      <div class="pacing-priority-card">
        <h4>Mastery Signal</h4>

        <p>
          Run a privacy-safe Mastery analysis
          to connect mastery evidence to pacing.
        </p>
      </div>
    `
}
<div class="pacing-priority-card">
  <h4>Instructional Guidance</h4>

  <p>
    <strong>
      ${instructionalGuidance.title}
    </strong>
  </p>

  <p>
    ${instructionalGuidance.message}
  </p>
</div>
${
  dataActionBrief
    ? `
      <div class="pacing-priority-card">
        <h4>Data Action Brief</h4>

        <p>
  <strong>Reteach Focus:</strong>
  ${dataActionBrief.reteachTarget}
</p>
${
  dataActionBrief.standard
    ? `
      <p>
        <strong>Standard:</strong>
        ${dataActionBrief.standard}
      </p>
    `
    : ""
}
${
  dataActionBrief.sourceQuestion &&
  dataActionBrief.sourceQuestion !==
    dataActionBrief.reteachTarget
    ? `
      <p>
        <strong>Assessment Source:</strong>
        ${dataActionBrief.sourceQuestion}
      </p>
    `
    : ""
}

<p>
  <strong>Current Mastery:</strong>
  ${dataActionBrief.mastery}%
</p>

        <p>
          <strong>Pacing Context:</strong>
          ${dataActionBrief.pacing}
        </p>

        <p>
          <strong>Instructional Response:</strong>
          ${dataActionBrief.response}
        </p>

        <p>
          <strong>Evidence to Collect:</strong>
          ${dataActionBrief.evidence}
        </p>

        <button
          type="button"
          id="copyDataActionBriefButton"
        >
          Copy Data Brief
        </button>

        <p
          id="dataActionBriefCopyStatus"
        ></p>
      </div>
    `
    : ""
}
<div class="pacing-position-grid">

  <div class="pacing-position-card">

    <span class="eyebrow">
      Expected Position
    </span>

    
      ${
  expectedUnitPosition
    ? expectedUnitPosition.unitMeetings > 0
      ? `
        <h4>
          ${expectedUnitPosition.unitTitle}
        </h4>

        <p>
          Meeting
          ${expectedUnitPosition.meetingInUnit}
          of
          ${expectedUnitPosition.unitMeetings}
        </p>
      `
      : `
        <h4>
          Beyond Planned Units
        </h4>

        <p>
          ${expectedUnitPosition.meetingInUnit}
          instructional meetings are currently
          unassigned to a planned unit.
        </p>
      `
    : `
      <p>
        Add unit meeting counts
        to view expected position.
      </p>
    `
}
        

  </div>


  <div class="pacing-position-card">

    <span class="eyebrow">
      Current Position
    </span>

   ${
  actualUnitPosition
    ? actualUnitPosition.unitMeetings > 0
      ? `
        <h4>
          ${actualUnitPosition.unitTitle}
        </h4>

        <p>
          Meeting
          ${actualUnitPosition.meetingInUnit}
          of
          ${actualUnitPosition.unitMeetings}
        </p>
      `
      : `
        <h4>
          Beyond Planned Units
        </h4>

        <p>
          ${actualUnitPosition.meetingInUnit}
          instructional meetings are currently
          beyond the planned unit map.
        </p>
      `
    : `
      <p>
        Add unit meeting counts
        to view current position.
      </p>
    `
}

  </div>

</div>
  `;

}
function runPacingCheck() {

  const actualMeetingInput =
    document.getElementById(
      "currentSemesterMeeting"
    );


  if (
    !actualMeetingInput
  ) {

    return;

  }


  const actualMeetings =
    Number(
      actualMeetingInput.value
    );


  if (
    actualMeetingInput.value === ""
    ||
    actualMeetings < 0
  ) {

    alert(
      "Enter the number of instructional meetings you have completed."
    );

    return;

  }


  /*
    The four values below must use the SAME
    semester field IDs already used inside
    buildSemesterMap().
  */


const startDate =
  document.getElementById(
    "semesterStart"
  ).value;


const endDate =
  document.getElementById(
    "semesterEnd"
  ).value;


const schedule =
  document.getElementById(
    "semesterSchedule"
  ).value;


const rotation =
  document.getElementById(
    "courseRotation"
  ).value;
const interruptions =
  getCalendarInterruptions();

const units =
  getSemesterUnits();
if (
  !startDate
  ||
  !endDate
) {

  alert(
    "Add your semester start and end dates before checking pacing."
  );

 return;

}


const expectedMeetings =
  calculateExpectedMeetingsToToday(
    startDate,
    endDate,
    schedule,
    rotation,
    interruptions
  );
  
const expectedUnitPosition =
  getUnitPositionFromMeeting(
    expectedMeetings,
    units
  );


const actualUnitPosition =
  getUnitPositionFromMeeting(
    actualMeetings,
    units
  );

displayPacingResults(
  expectedMeetings,
  actualMeetings,
  expectedUnitPosition,
  actualUnitPosition
);
  }
const checkPacingButton =
  document.getElementById(
    "checkPacingButton"
  );


if (
  checkPacingButton
) {

  checkPacingButton
    .addEventListener(
      "click",
      runPacingCheck
    );

}
