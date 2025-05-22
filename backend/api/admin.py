from django.contrib import admin
import api.models as md

admin.site.register(md.User)

admin.site.register(md.Ingredient)
admin.site.register(md.Pizza)
admin.site.register(md.PizzaIngredient)

admin.site.register(md.Order)
admin.site.register(md.OrderItem)
admin.site.register(md.OrderItemIngredient)

admin.site.register(md.DeliveryAddress)

admin.site.register(md.PaymentMethod)