function isValidUUID(uuid) {
    if (!uuid) return false;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}



function isValidISODate(dateString) {
    if (!dateString) return false;

    const isoDateRegex = /^\d{4}-\d{2}-\d{2}(?:[Tt][\d:.+-]*)?$/;
    return isoDateRegex.test(dateString);
}

module.exports = { isValidUUID, isValidISODate };
