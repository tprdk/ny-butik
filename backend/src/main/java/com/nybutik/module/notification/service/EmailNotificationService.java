package com.nybutik.module.notification.service;

import com.nybutik.module.order.entity.Order;
import com.nybutik.module.return_.entity.Return;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.text.NumberFormat;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationService implements NotificationService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${app.mail.from:noreply@nybutik.com}")
    private String fromAddress;

    private static final NumberFormat PRICE_FORMAT = NumberFormat.getCurrencyInstance(new Locale("tr", "TR"));

    @Async
    @Override
    public void sendOrderConfirmation(Order order) {
        try {
            String customerName = order.getUser().getFirstName();
            String orderNumber = order.getOrderNumber();

            Context ctx = new Context(new Locale("tr", "TR"));
            ctx.setVariable("customerName", customerName);
            ctx.setVariable("orderNumber", orderNumber);
            ctx.setVariable("totalAmount", PRICE_FORMAT.format(order.getTotalAmount()));
            ctx.setVariable("shippingCity", order.getShippingCity());

            String html = templateEngine.process("email/order-confirmation", ctx);

            sendHtmlEmail(
                order.getUser().getEmail(),
                "Siparişiniz Alındı — #" + orderNumber,
                html
            );
        } catch (Exception e) {
            log.error("Sipariş onay e-postası gönderilemedi. orderNumber={}", order.getOrderNumber(), e);
        }
    }

    @Async
    @Override
    public void sendReturnConfirmation(Return returnRequest) {
        try {
            String orderNumber = returnRequest.getOrder().getOrderNumber();
            int itemCount = returnRequest.getItems().size();

            Context ctx = new Context(new Locale("tr", "TR"));
            ctx.setVariable("customerName", returnRequest.getUser().getFirstName());
            ctx.setVariable("orderNumber", orderNumber);
            ctx.setVariable("returnId", returnRequest.getId());
            ctx.setVariable("reason", returnRequest.getReason().name());
            ctx.setVariable("itemCount", itemCount);

            String html = templateEngine.process("email/return-confirmation", ctx);

            sendHtmlEmail(
                returnRequest.getUser().getEmail(),
                "İade Talebiniz Alındı — Sipariş #" + orderNumber,
                html
            );
        } catch (Exception e) {
            log.error("İade onay e-postası gönderilemedi. returnId={}", returnRequest.getId(), e);
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromAddress);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);
        mailSender.send(message);
    }
}
