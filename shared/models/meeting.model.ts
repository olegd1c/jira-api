export const weeksType = [
    {id: 2, name: 'всі'},
    {id: 0, name: 'парні'},
    {id: 1, name: 'не парні'},
];

export const daysCron = [
    {id: "* * * * 1", name: 'Пн'},
    {id: "* * * * 2", name: 'Вт'},
    {id: "* * * * 3", name: 'Ср'},
    {id: "* * * * 4", name: 'Чт'},
    {id: "* * * * 5", name: 'Пт'},
    {id: "* * * * 1,2,4,5", name: 'Пн,Вт,Чт,Пт'},
    {id: "* * * * 1-5", name: 'Пн,Вт,Ср,Чт,Пт'},
];

export function weeksTypeArray() {
    const tmp = [];
    weeksType.map(item => {
        tmp[item.id] = item.name;
    });

    return tmp;
}

export function daysCronArray() {
    const tmp = [];
    daysCron.map(item => {
        tmp[item.id] = item.name;
    });

    return tmp;
}

export enum StatusMeeting {
    active = 'Активна',
    blocked = 'Заблокована'
}