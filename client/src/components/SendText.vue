<template>
    <div>
        <div class="headline text--primary mb-4">发送文本</div>
        <v-textarea
            ref="textarea"
            no-resize
            outlined
            dense
            rows="6"
            :counter="!isImage && $root.config.text.limit"
            placeholder="请输入需要发送的文本"
            v-model="$root.send.text"
        ></v-textarea>
        <div class="text-right">
            <v-btn
                color="primary"
                :block="$vuetify.breakpoint.smAndDown"
                :disabled="!$root.send.text || !$root.websocket || (!isImage && $root.send.text.length > $root.config.text.limit)"
                @click="send"
            >发送</v-btn>
        </div>
    </div>
</template>

<script>
import {isImageDataURI, dataURItoFile} from '@/util.js';

export default {
    name: 'send-text',
    computed: {
        /**
         * 输入内容是否为图片 data URI（如 `data:image/jpeg;base64,...`）。
         * 此类内容不受文本长度限制（改受服务端文件大小限制），
         * 发送时会自动转换为图片文件并通过 /upload 接口上传。
         */
        isImage() {
            return isImageDataURI(this.$root.send.text);
        },
    },
    methods: {
        focus() {
            this.$refs.textarea.focus();
        },
        send() {
            const text = this.$root.send.text;
            let request;
            if (this.isImage) {
                // 识别为图片 data URI：转换为 File 后改走文件上传接口，
                // 服务端会存储文件、生成缩略图，并以图片消息的形式实时广播
                const file = dataURItoFile(text);
                if (!file) return this.$toast('图片解析失败，请检查 data URI 是否完整');
                const fd = new FormData;
                fd.set('file', file);
                request = this.$http.postForm('upload', fd, {
                    params: new URLSearchParams([['room', this.$root.room]]),
                });
            } else {
                request = this.$http.post(
                    'text',
                    text,
                    {
                        params: new URLSearchParams([['room', this.$root.room]]),
                        headers: {
                            'Content-Type': 'text/plain',
                        },
                    },
                );
            }
            request.then(response => {
                this.$toast(this.isImage ? '已识别为图片并发送' : '发送成功');
                this.$root.send.text = '';
            }).catch(error => {
                if (error.response && error.response.data.msg) {
                    this.$toast(`发送失败：${error.response.data.msg}`);
                } else {
                    this.$toast('发送失败');
                }
            });
        },
    },
}
</script>
