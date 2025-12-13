const express = require("express");
const router = express.Router();
const { getSurveyIdByAlias } = require("../services/formbricks");

router.get("/:root/:survey", (req, res) => {
  const { root, survey } = req.params;
  console.log(`Requesting survey: root=${root}, survey=${survey}`);
  const result = getSurveyIdByAlias(root, survey);

  if (result) {
    const { surveyId, environmentId, type } = result;
    console.log(
      `Found surveyId: ${surveyId}, environmentId: ${environmentId}, type: ${type}`
    );

    // Redirect link surveys to Formbricks (via intermediate page for OG tags)
    if (type === "link") {
      const redirectUrl = `${process.env.FORMBRICKS_SDK_URL}/s/${surveyId}`;
      console.log(`Rendering redirect page for: ${redirectUrl}`);
      return res.render("redirect", {
        title: "Vanity | formbricks",
        redirectUrl: redirectUrl,
        currentUrl: `${process.env.BASE_DOMAIN}/${root}/${survey}`,
        baseDomain: process.env.BASE_DOMAIN,
      });
    }

    // Embed app surveys
    res.render("survey", {
      title: `${root} - ${survey}`,
      surveyId: surveyId,
      formbricksSdkUrl: process.env.FORMBRICKS_SDK_URL,
      formbricksEnvId: environmentId,
      baseDomain: process.env.BASE_DOMAIN,
    });
  } else {
    console.log("Survey not found");
    res.status(404).send("Survey not found");
  }
});

module.exports = router;
