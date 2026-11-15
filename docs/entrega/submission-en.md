# Gamma Alert — submission draft

> Draft for team review, 15 November 2026. This is not a submitted entry or an official
> assessment. Confirm the registered challenge, final deployment, licensing and submission
> requirements before publishing.

## Challenge

[Dancing with the SARs](https://www.spaceappschallenge.org/2026/challenges/dancing-with-the-sars/).

## Team and links

- Team: **Astral Codes** (Andy Piedra, David, Samuel, Jorge, Leo).
- Repository: <https://github.com/malbodifh/nasa-space-2026>.
- Live app: <https://nasa-space-2026.vercel.app/>.
- Video: _pending — record ≤30 s, English or English subtitles._

Fill in the video link and confirm the deployed URL before submitting.

## Project summary

Gamma Alert connects natural-hazard reports in Costa Rica with an interactive exploration
of surface change using NASA–ISRO NISAR radar. People can examine a report's source and time,
then explore available radar acquisitions, compare two dates and investigate possible physical
explanations for changes in image brightness.

The project uses public NISAR L2 GCOV browse images distributed by ASF DAAC, catalogued through
NASA CMR. Four precomputed study areas—Palo Verde, Caño Negro, Rincón de la Vieja and
Tortuguero—provide reproducible examples, including low-change comparisons. The app also searches
for available imagery around an event location. No image coverage means no valid comparison,
not evidence of no impact.

## Why radar?

L-band radar can observe at night and through clouds. That makes it useful for exploring
Costa Rica's cloudy wetlands and vegetated landscapes. The display combines HH and HV
polarizations; the project discusses possible effects of moisture, vegetation, open water,
double-bounce scattering and viewing geometry.

These are hypotheses to investigate, not automatic causal diagnoses.

## What the prototype actually measures

The prototype compares **8-bit browse-image brightness**, not calibrated gamma0, displacement
or confirmed damage. It smooths HH and uses an exploratory brightness-difference threshold.
Percentages describe comparable pixels, not inundated or damaged land area. Precomputed and
browser comparisons use different brightness-offset corrections, documented in the method.
Some comparisons mix provisional and validated product versions.

No flood area, landslide probability, damage estimate or prediction accuracy is claimed.

## Data and complementary sources

- NISAR / ASF DAAC: <https://nisar.jpl.nasa.gov/> and <https://nisar-docs.asf.alaska.edu/gcov/>.
- NASA CMR: <https://cmr.earthdata.nasa.gov/search/>.
- NASA EONET: <https://eonet.gsfc.nasa.gov/>.
- NASA Worldview: <https://worldview.earthdata.nasa.gov/>.
- NASA GIBS and POWER: <https://gibs.earthdata.nasa.gov/> and <https://power.larc.nasa.gov/>.
- Earthquake reports: USGS, OVSICORI–UNA and RSN UCR–ICE.
- Tsunami and cyclone bulletins: NOAA PTWC/NTWC and NHC.
- Other context: GDACS, Open-Meteo forecasts, OpenStreetMap, Carto, Smithsonian GVP and Natural Earth.

Original report titles remain in their source language; app controls and explanations have
Spanish and English versions. Each data source retains its own limitations. A lack of reported
events does not establish safety. Follow CNE and emergency services for official advice.

## AI and attribution

AI assisted code, translation, testing and review: OpenAI GPT-6.1 Sol handled implementation;
DeepSeek V4.1 assisted independent auditing. The team remains responsible for reviewing results.
AI-generated internal scores are not NASA or jury scores.

Verify dependency, map, image and code-license attribution before submission. A public repository
alone does not establish an open-source license; the team must confirm its license.

## Reproducibility

- The four demonstration areas are precomputed, so the study opens offline for them.
- `pnpm --dir web dev` runs locally; no environment variable is required.
- `pnpm --dir web test` covers parsers, alert rules, the SAR change math and API contracts.
- Method, limits and every source are documented in `docs/producto/` and `docs/tecnico/`.
- Regenerating the radar dataset needs network and is **not** required to run the demo:
  `node scripts/build-nisar.mjs` (see `docs/producto/nisar.md`).

## Suggested 30-second demo script

“A disaster report tells us what happened. Radar helps us explore what changed.
Gamma Alert brings Costa Rican hazard reports together with NASA–ISRO NISAR.
Open a report, check its source and time, then compare available radar dates.
Explore wetlands and volcanic landscapes even when clouds block optical images.
Our change layer is an exploratory comparison of browse-image brightness—not confirmed damage.
We make the data, uncertainty and limits visible, so people can ask better questions.”

## Human checklist before submitting

- Confirm challenge registration, current official rules and deadline.
- Select the reviewed `develop` preview; do not present an unreviewed local build as production.
- Open the English interface and verify the final demo on mobile.
- Record the video and check its duration, language/subtitles and readable labels.
- List source references, AI assistance and applicable licenses.
- Submit through the official team account. No submission was performed by this automation.
