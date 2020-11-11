import { createParamDecorator } from "@nestjs/common";

export const GetUser = createParamDecorator((data, req) => {
    let user = null;
    if (req.args && req.args.length && req.args[0].user) {
        user = {username: req.args[0].user.username, displayName: req.args[0].user.displayName};
    }
    return user;
});