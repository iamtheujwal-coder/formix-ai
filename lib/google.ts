import { google, forms_v1 } from "googleapis";
import { FormSchema, FormQuestion } from "../types/form";

export const createGoogleForm = async (
  accessToken: string,
  formData: FormSchema
): Promise<{ link: string }> => {
  try {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials({ access_token: accessToken });

    const forms = google.forms({ version: "v1", auth });

    // 1. Create the blank form with title + description
    const createRes = await forms.forms.create({
      requestBody: {
        info: {
          title: formData.title,
          documentTitle: formData.title,
        },
      },
    });

    const formId = createRes.data.formId!;
    const responderUri = createRes.data.responderUri!;

    // 2. Prepare requests: set description + add all questions
    const requests: forms_v1.Schema$Request[] = [];

    // Set form description if provided
    if (formData.description) {
      requests.push({
        updateFormInfo: {
          info: {
            description: formData.description,
          },
          updateMask: "description",
        },
      });
    }

    // 3. Format questions for batchUpdate
    formData.questions.forEach((q: FormQuestion, index: number) => {
      let item: forms_v1.Schema$Item = {
        title: q.question,
      };

      switch (q.type) {
        case "short_text":
          item.questionItem = {
            question: {
              required: q.required ?? true,
              textQuestion: { paragraph: false },
            },
          };
          break;

        case "paragraph":
          item.questionItem = {
            question: {
              required: q.required ?? false,
              textQuestion: { paragraph: true },
            },
          };
          break;

        case "multiple_choice":
          item.questionItem = {
            question: {
              required: q.required ?? true,
              choiceQuestion: {
                type: "RADIO",
                options: (q.options || ["Option 1", "Option 2"]).map(
                  (opt) => ({ value: opt })
                ),
              },
            },
          };
          break;

        case "checkbox":
          item.questionItem = {
            question: {
              required: q.required ?? false,
              choiceQuestion: {
                type: "CHECKBOX",
                options: (q.options || ["Option 1", "Option 2"]).map(
                  (opt) => ({ value: opt })
                ),
              },
            },
          };
          break;

        case "dropdown":
          item.questionItem = {
            question: {
              required: q.required ?? true,
              choiceQuestion: {
                type: "DROP_DOWN",
                options: (q.options || ["Option 1", "Option 2"]).map(
                  (opt) => ({ value: opt })
                ),
              },
            },
          };
          break;

        case "scale":
          item.questionItem = {
            question: {
              required: q.required ?? true,
              scaleQuestion: {
                low: q.scaleMin ?? 1,
                high: q.scaleMax ?? 5,
                lowLabel: q.scaleMinLabel || "",
                highLabel: q.scaleMaxLabel || "",
              },
            },
          };
          break;

        case "date":
          item.questionItem = {
            question: {
              required: q.required ?? false,
              dateQuestion: {
                includeTime: false,
                includeYear: true,
              },
            },
          };
          break;

        case "section_header":
          // Section headers use pageBreakItem
          item = {
            title: q.question,
            pageBreakItem: {},
          };
          break;

        default:
          // Fallback to short text
          item.questionItem = {
            question: {
              required: false,
              textQuestion: { paragraph: false },
            },
          };
      }

      requests.push({
        createItem: {
          item,
          location: { index },
        },
      });
    });

    // 4. Execute batchUpdate
    if (requests.length > 0) {
      await forms.forms.batchUpdate({
        formId,
        requestBody: { requests },
      });
    }

    return { link: responderUri };
  } catch (error) {
    console.error("Google Forms API Error:", error);
    throw new Error(
      error instanceof Error
        ? `Failed to create Google Form: ${error.message}`
        : "Failed to create Google Form"
    );
  }
};
