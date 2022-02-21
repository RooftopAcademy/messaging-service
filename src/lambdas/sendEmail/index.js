const renderText = require('./renderText');
const transporter = require('./transporter');
const zip = require('./zip');
const sendSQSMessage = require('./sendSQSMessage');

exports.handler = async function (event) {
  await Promise.all(
    event.Records.map(async (record) => {
      const body = JSON.parse(record.body);

      await Promise.all(
        body.map(async (delivery) => {
          const { message } = delivery;

          const mailsResponses = await Promise.allSettled(
            zip(delivery.recipients, delivery.data ?? []).map((mail) => {
              const [recipient, data] = mail;

              const messageOptions = {
                from: process.env.EMAIL_USER,
                to: recipient.email,
                subject: message.subject ?? '',
                text: renderText(message.contentPlain ?? '', data),
                html: renderText(message.contentHtml ?? '', data),
              };

              return transporter.sendMail(messageOptions);
            })
          );

          const eventDetail = {
            deliveryId: delivery._id,
            body: {
              status: 'DONE',
              statistics: {
                total: mailsResponses.length,
                success: mailsResponses.filter(
                  (value) => value.status === 'fulfilled'
                ).length,
                failed: mailsResponses.filter(
                  (value) => value.status === 'rejected'
                ).length,
                pending: 0,
              },
            },
          };

          return sendSQSMessage(eventDetail);
        })
      );
    })
  );

  return {};
};
