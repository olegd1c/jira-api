import { Task } from '@shared_models/task.model';
import { Meeting } from '@app/controllers/meeting/meeting.schema';
import { User as UserMeeting } from '@app/controllers/user/user.schema';
import { StatusUser } from "@shared_models/users.model";

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
