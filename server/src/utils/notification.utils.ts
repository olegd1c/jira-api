import { Task } from '@shared_models/task.model';
import { Meeting } from '@app/controllers/meeting/meeting.schema';
import { User as UserMeeting } from '@app/controllers/user/user.schema';
import { StatusUser } from "@shared_models/users.model";
import { AnnouncementData, AnnouncementTask } from "@shared_models/announcement.model";

export function parseReviewTasks(tasks: Task[], users: UserMeeting[]): Meeting[] {
    let title = 'Задача в ревью: ' + "\n";
    const result: Meeting[] = [];

    if (tasks) {
        tasks.forEach((item: Task) => {
            let tempMeeting: any = { title: title + item.link + "\n" + item.summary, users: [] };
            item.reviewers.forEach((reviewer: string) => {
                let tmpReviewer: any = { name: reviewer, telegramLogin: '', email: '', status: StatusUser.active };

                const fUser = users.filter((u) => u.jiraLogin == reviewer);

                if (fUser.length > 0) {
                    tmpReviewer.name = fUser[0].name;
                    const fReviewsConductediews = item.reviews_conducted.filter((elem) => elem == reviewer);
                    if (fReviewsConductediews.length == 0) {
                        tmpReviewer.telegramLogin = fUser[0].telegramLogin;
                        tmpReviewer.email = fUser[0].email;
                    } else {
                        tmpReviewer.name = tmpReviewer.name + ' ✅';
                    }
                }
                tempMeeting.users.push(tmpReviewer);
            });
            result.push(tempMeeting);
        });
    }

    return result;
}

export function parseMissingTimeTasks(tasks: Task[], users: UserMeeting[]): Meeting | null {
    if (!tasks || tasks.length === 0) {
        return null;
    }

    let title = '⏳ Будь ласка, заповніть фактичний час виконання задач: ' + "\n\n";

    tasks.forEach((item: Task) => {
        let devInfo = '';
        if (item.devName) {
            const fUser = users.filter((u) => u.jiraLogin == item.devName);
            if (fUser.length > 0) {
                devInfo = ` — ${fUser[0].name}` + (fUser[0].email ? ` @${fUser[0].email}` : '');
            } else {
                devInfo = ` — ${item.devName}`;
            }
        }
        title += `• ${item.link} — ${item.summary}${devInfo}` + "\n";
    });

    return { title, users: [] } as any;
}

export function prepareCardV2MissingTime(tasks: Task[], users: UserMeeting[]): any {
    const widgets = [];

    tasks.forEach((item: Task) => {
        let devInfo = '';
        const fUser = users.find((u) => u.jiraLogin == item.devName);
        if (fUser) {
            const mention = fUser.email ? ` (<users/${fUser.email}>)` : '';
            devInfo = `👤 <b>${fUser.name}</b>${mention}`;
        } else {
            devInfo = `👤 <b>${item.devName}</b>`;
        }

        widgets.push({
            decoratedText: {
                topLabel: item.key,
                text: item.summary,
                bottomLabel: devInfo,
                startIcon: {
                    knownIcon: "CLOCK"
                },
                button: {
                    text: "Jira",
                    onClick: {
                        openLink: {
                            url: item.link
                        }
                    }
                }
            }
        });

        widgets.push({ divider: {} });
    });

    if (widgets.length > 0) {
        widgets.pop(); // Видаляємо останній роздільник
    }

    return {
        cardsV2: [
            {
                cardId: "missingTimeCard",
                card: {
                    header: {
                        title: "⏳ Time Tracking Reminder",
                        subtitle: "Будь ласка, заповніть фактичний час розробки",
                        imageUrl: "https://fonts.gstatic.com/s/i/short_term/release/googlestars/clock/default/24px.svg",
                        imageType: "CIRCLE"
                    },
                    sections: [
                        {
                            widgets: widgets
                        }
                    ]
                }
            }
        ]
    };
}

export function prepareMessageWebHook(item: Meeting, sendAll = false): string {
    let mess = '';
    mess = mess + item.title + "\n";
    if (sendAll) {
        mess = mess + '<users/all>' + "\n";
    }
    const _users = item.users.filter(user => user.status === StatusUser.active);
    if (_users.length > 0) {
        _users.map(u => {
            mess = mess + u.name + (!sendAll && u.email ? ' @' + u.email : '') + "\n";
        });
    }

    return mess;
}

export function prepareMessage(item: Meeting): string {
    let mess = '';
    const _users = item.users.filter(user => user.status === StatusUser.active);
    if (_users.length > 0) {
        mess = item.title + "\n";
        _users.map(u => {
            mess = mess + u.name + (u.telegramLogin ? ' @' + u.telegramLogin : '') + "\n";
        });
    }

    return mess;
}

export function prepareCardV2ReviewTasks(tasks: Task[], users: UserMeeting[]): any {
    const widgets: any[] = [];

    if (!tasks || tasks.length === 0) {
        return null;
    }

    tasks.forEach((item: Task) => {
        let reviewersList: string[] = [];

        item.reviewers.forEach((reviewer: string) => {
            const fUser = users.find((u) => u.jiraLogin == reviewer);
            let reviewerDisplay = reviewer;

            if (fUser) {
                reviewerDisplay = fUser.name;
                const fReviewsConducted = item.reviews_conducted.filter((elem) => elem == reviewer);
                if (fReviewsConducted.length == 0) {
                    if (fUser.email) {
                        reviewerDisplay += ` (<users/${fUser.email}>)`;
                    }
                } else {
                    reviewerDisplay += ' ✅';
                }
            }
            reviewersList.push(`👤 <b>${reviewerDisplay}</b>`);
        });

        widgets.push({
            decoratedText: {
                topLabel: item.key,
                text: item.summary,
                bottomLabel: reviewersList.join('<br>'),
                wrapText: true,
                startIcon: {
                    knownIcon: "PERSON"
                },
                button: {
                    text: "Jira",
                    onClick: {
                        openLink: {
                            url: item.link
                        }
                    }
                }
            }
        });

        widgets.push({ divider: {} });
    });

    if (widgets.length > 0) {
        widgets.pop(); // Видаляємо останній роздільник
    }

    return {
        cardsV2: [
            {
                cardId: "reviewTasksCard",
                card: {
                    header: {
                        title: "👀 Code Review Reminder",
                        subtitle: "Задачі, які очікують на ревью",
                        imageUrl: "https://fonts.gstatic.com/s/i/short_term/release/googlestars/rate_review/default/24px.svg",
                        imageType: "CIRCLE"
                    },
                    sections: [
                        {
                            widgets: widgets
                        }
                    ]
                }
            }
        ]
    };
}

export function prepareCardV2Announcement(data: AnnouncementData, user: any): any {
    const widgets: any[] = [];
    let dateStr = '';

    if (data.date) {
        const d = new Date(data.date);

        if (!isNaN(d.getTime())) {
            dateStr = d.toLocaleString('sv-SE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            }).replace('T', ' '); // sv-SE дає формат YYYY-MM-DD
        } else {
            dateStr = '';
        }
    }

    widgets.push({
        decoratedText: {
            text: `<b>Дата та час:</b> ${dateStr}`,
            startIcon: { knownIcon: "CLOCK" }
        }
    });
    widgets.push({
        decoratedText: {
            text: `<b>Відповідальний:</b> ${data.executor}`,
            startIcon: { knownIcon: "PERSON" }
        }
    });

    widgets.push({ divider: {} });

    if (data.tasks && data.tasks.length > 0) {
        data.tasks.forEach((item: AnnouncementTask) => {
            let taskInfo = `<b>Виконавець:</b> ${item.devName}<br><b>Тестувальник:</b> ${item.testName}<br><b>Підтвердження бізнесу:</b> ${item.confirm}`;
            if (item.info) {
                taskInfo = `${item.info}<br>${taskInfo}`;
            }

            widgets.push({
                decoratedText: {
                    topLabel: item.key,
                    text: item.summary,
                    bottomLabel: taskInfo,
                    wrapText: true,
                    startIcon: { knownIcon: "TICKET" },
                    button: {
                        text: "Jira",
                        onClick: {
                            openLink: { url: item.link }
                        }
                    }
                }
            });
            widgets.push({ divider: {} });
        });
    }

    widgets.push({
        decoratedText: {
            text: `Автор повідомлення: ${user?.displayName || user?.name || ''}`,
            startIcon: { knownIcon: "PERSON" }
        }
    });

    return {
        cardsV2: [
            {
                cardId: "announcementCard",
                card: {
                    header: {
                        title: "🚀 Запланований деплой",
                        imageUrl: "https://fonts.gstatic.com/s/i/short_term/release/googlestars/rocket/default/24px.svg",
                        imageType: "CIRCLE"
                    },
                    sections: [
                        {
                            widgets: widgets
                        }
                    ]
                }
            }
        ]
    };
}
