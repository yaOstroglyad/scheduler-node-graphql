exports.entityNotExistException = (entityName, entity) => {
    if(!entity) {
        throw new Error(`${entityName} does not exist!`)
    }
}
