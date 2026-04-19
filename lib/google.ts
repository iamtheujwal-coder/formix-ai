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

    // 1. Create the blank form
    const createRes = await forms.forms.create({
      requestBody: {
        info: {
          title: formData.title,
        },
      },
    });

    const formId = createRes.data.formId!;
    const responderUri = createRes.data.responderUri!;

    // 2. Format questions for batchUpdate
    const requests: forms_v1.Schema$Request[] = formData.questions.map(
      (q: FormQuestion, index: number) => {
        let item: forms_v1.Schema$Item = {
          title: q.question,
        };

        if (q.type === "short_text") {
          item.questionItem = {
            question: {
              textQuestion: { paragraph: false },
            },
          };
        } else if (q.type === "paragraph") {
          item.questionItem = {
            question: {
              textQuestion: { paragraph: true },
            },
          };
        } else if (q.type === "multiple_choice") {
          item.questionItem = {
            question: {
              choiceQuestion: {
                type: "RADIO",
                options: q.options?.map((opt) => ({ value: opt })) || [
                  { value: "Option 1" },
                ],
              },
            },
          };
        }

        return {
          createItem: {
            item,
            location: { index },
          },
        };
      }
    );

    // 3. Add questions to the form
    if (requests.length > 0) {
      await forms.forms.batchUpdate({
        formId,
        requestBody: {
          requests,
        },
      });
    }

    return { link: responderUri };
  } catch (error) {
    console.error("Google Forms API Error:", error);
    throw new Error("Failed to create Google Form");
  }
};
