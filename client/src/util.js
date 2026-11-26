export function prettyFileSize(size) {
    let units = ['TB', 'GB', 'MB', 'KB'];
    let unit = 'Bytes';
    while (size >= 1024 && units.length) {
        size /= 1024;
        unit = units.pop();
    };
    return `${Math.floor(100 * size) / 100} ${unit}`;
}

export function percentage(value, decimal = 2) {
    return (value * 100).toFixed(decimal) + '%';
}

/**
 * 检测字符串是否为图片的 data URI（如从网页复制的 `data:image/jpeg;base64,...`）。
 * base64 部分允许包含换行等空白字符（atob 解码时会自动忽略）。
 * @param {String} text
 * @returns {Boolean}
 */
export function isImageDataURI(text) {
    return /^data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=\s]+$/i.test(String(text).trim());
}

/**
 * 将图片 data URI 转换为 File 对象，以便通过 /upload 接口以图片形式上传。
 * @param {String} dataURI
 * @param {String} [name] 文件名，缺省时按当前时间戳生成，扩展名取自 MIME 类型
 * @returns {File|null} 格式非法或 base64 解码失败时返回 null
 */
export function dataURItoFile(dataURI, name) {
    const match = /^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=\s]+)$/i.exec(String(dataURI).trim());
    if (!match) return null;
    try {
        const binary = atob(match[2]);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        // image/jpeg → jpg，其余 MIME 的子类型直接作为扩展名
        const ext = match[1].split('/')[1].replace('jpeg', 'jpg');
        return new File([bytes], name || `image-${Date.now()}.${ext}`, {type: match[1]});
    } catch {
        return null;
    }
}

export function formatTimestamp(timestamp) {
    let date = new Date(timestamp * 1000);
    return ''
        + date.getFullYear() + '-'
        + (date.getMonth() + 1).toString().padStart(2, 0) + '-'
        + date.getDate().toString().padStart(2, 0) + ' '
        + date.getHours().toString().padStart(2, 0) + ':'
        + date.getMinutes().toString().padStart(2, 0) + ':'
        + date.getSeconds().toString().padStart(2, 0);
};